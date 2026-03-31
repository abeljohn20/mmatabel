"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Types ─── */

interface ShotInstance {
  x: number; // metres from left sideline (0 = left, 6.10 = right)
  y: number; // metres from net (0 = net, 6.70 = back boundary)
  height: "high" | "medium" | "low";
  accuracy: "good" | "average" | "bad";  // maps to GREEN/AMBER/RED
  length?: "good" | "average" | "bad";   // maps to GREEN/AMBER/RED — undefined for smashes etc.
  videoTime?: number; // seconds into match video
}

/* ─── Court dimensions (metres) ─── */
const COURT_WIDTH = 6.10;    // doubles width
const HALF_COURT_LENGTH = 6.70; // net to back boundary

/*
  Opponent half-court zones (as % of court):
  y: 0% = back boundary (top), 100% = net (bottom)
  x: 0% = left, 100% = right

  Front:  y 70-100% (near net, 0-2m from net)
  Mid:    y 35-70%  (2-4.3m from net)
  Back:   y 0-35%   (4.3-6.7m from net, near back line)
  Left:   x 0-50%
  Right:  x 50-100%
*/
type CourtZoneRect = { top: string; left: string; width: string; height: string };

/*
  Mirrored view: player sees opponent's court as a mirror.
  "Back right" from player's view → top-LEFT on the opponent court SVG
  "Front left" from player's view → bottom-RIGHT on the opponent court SVG

  SVG layout: top = back boundary, bottom = net
  Left/Right are mirrored (player's right = SVG left)

  Singles court: sidelines at 7.5% and 92.5% (0.46m and 5.64m of 6.10m)
  So each half is 7.5% to 50% (left) or 50% to 92.5% (right)
  Width of each half = 42.5%
*/
/*
  Court boundary insets (from SVG viewBox 0 0 200 160):
  Top boundary: y=8 → 5%
  Bottom (net): y=152 → 95%
  Singles sidelines: x=20,180 → 10%, 90%
  Center line: x=100 → 50%
  Short service line: y=60 → 37.5%

  Playable area: top 5% to bottom 95%, left 10% to right 90%
  Each half: left 10%-50% or 50%-90% (width 40%)
  Depth zones: Front 65%-95%, Mid 37.5%-65%, Back 5%-37.5%
*/
const OPPONENT_ZONES: Record<string, CourtZoneRect> = {
  "Front left":  { top: "65%",   left: "50%", width: "40%", height: "30%" },
  "Front right": { top: "65%",   left: "10%", width: "40%", height: "30%" },
  "Mid left":    { top: "37.5%", left: "50%", width: "40%", height: "27.5%" },
  "Mid right":   { top: "37.5%", left: "10%", width: "40%", height: "27.5%" },
  "Back left":   { top: "5%",    left: "50%", width: "40%", height: "32.5%" },
  "Back right":  { top: "5%",    left: "10%", width: "40%", height: "32.5%" },
};

/** Map shot name → which opponent zone it lands in + length type */
function getShotLandingInfo(shotName: string): { zone: string; lengthType: "drop" | "lift" | "none" } {
  const sn = shotName.toLowerCase();

  // Drops/Defense/Netkeep/Dribble/Pulldrop → front court zones
  const isDropType = ["drop", "defense", "netkeep", "dribble", "pulldrop"].some(k => sn.includes(k));
  // Lifts/Clears → back court zones
  const isLiftType = ["lift", "clear"].some(k => sn.includes(k));
  // Smash → mid court, Push → back court, Flatgame/Drive → mid court
  const lengthType = isDropType ? "drop" : isLiftType ? "lift" : "none";

  // Determine specific zone from shot name using the CSV mapping
  // Cross shots go to opposite side, straight shots go same side
  const isCross = sn.includes("cross");

  if (isDropType) {
    // FH shots from front right → land front left (straight) or front right (cross)
    // BH shots from front left → land front right (straight) or front left (cross)
    // OH/BH from back left → land front right (straight) or front left (cross)
    if (sn.startsWith("fh")) return { zone: isCross ? "Front right" : "Front left", lengthType };
    if (sn.startsWith("bh")) return { zone: isCross ? "Front left" : "Front right", lengthType };
    if (sn.startsWith("oh")) return { zone: isCross ? "Front left" : "Front right", lengthType };
    return { zone: isCross ? "Front right" : "Front left", lengthType };
  }
  if (isLiftType) {
    if (sn.startsWith("fh")) return { zone: isCross ? "Back right" : "Back left", lengthType };
    if (sn.startsWith("bh")) return { zone: isCross ? "Back right" : "Back left", lengthType };
    return { zone: isCross ? "Back right" : "Back left", lengthType };
  }
  if (sn.includes("smash") || sn.includes("halfsmash")) {
    if (sn.startsWith("fh")) return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
    if (sn.startsWith("oh")) return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
    return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
  }
  if (sn.includes("push")) {
    if (sn.startsWith("fh")) return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
    if (sn.startsWith("bh")) return { zone: isCross ? "Mid left" : "Mid right", lengthType: "none" };
    return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
  }
  if (sn.includes("flatgame") || sn.includes("drive")) {
    if (sn.startsWith("fh")) return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
    if (sn.startsWith("bh")) return { zone: isCross ? "Mid left" : "Mid right", lengthType: "none" };
    return { zone: isCross ? "Mid right" : "Mid left", lengthType: "none" };
  }

  return { zone: "Mid left", lengthType: "none" };
}

/** Convert metres to % position on the SVG court */
function courtX(xMetres: number): number {
  return (xMetres / COURT_WIDTH) * 100;
}
function courtY(yMetres: number): number {
  // y=0 is net (bottom of SVG), y=6.7 is back boundary (top of SVG)
  return 100 - (yMetres / HALF_COURT_LENGTH) * 100;
}

interface ShotDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shotName: string;
  shotCount: number;
  avgEff: number;
  avgAccuracy: number;
  shots: ShotInstance[];
  videoSrc?: string;
  hasLength?: boolean; // whether this shot type has length data (drops/clears/lifts)
  hasHeight?: boolean; // whether this shot type has height data (lifts/clears only)
  narrative?: string;
  hideVideo?: boolean;
}

/* ─── Filter options ─── */

type AccuracyFilter = "all" | "good" | "average" | "bad";
type LengthFilter = "all" | "good" | "average" | "bad";
type HeightFilter = "all" | "high" | "medium" | "low";

const ACCURACY_OPTIONS: AccuracyFilter[] = ["all", "good", "average", "bad"];
const LENGTH_OPTIONS: LengthFilter[] = ["all", "good", "average", "bad"];
const HEIGHT_OPTIONS: HeightFilter[] = ["all", "high", "medium", "low"];

const ACCURACY_LABELS: Record<AccuracyFilter, string> = {
  all: "All",
  good: "Good",
  average: "Average",
  bad: "Bad",
};

const LENGTH_LABELS: Record<LengthFilter, string> = {
  all: "All",
  good: "Good Length",
  average: "Average Length",
  bad: "Bad Length",
};

const HEIGHT_LABELS: Record<HeightFilter, string> = {
  all: "All",
  high: "High shots",
  medium: "Medium shots",
  low: "Low shots",
};

const ACCURACY_DOT_COLORS: Record<AccuracyFilter, string> = {
  all: "#6f6f6f",
  good: "#58ed13",
  average: "#f2ef2c",
  bad: "#f21e1e",
};

const LENGTH_DOT_COLORS: Record<LengthFilter, string> = {
  all: "#6f6f6f",
  good: "#58ed13",
  average: "#f2ef2c",
  bad: "#f53d3d",
};

const HEIGHT_DOT_COLORS: Record<HeightFilter, string> = {
  all: "#6f6f6f",
  high: "#893fff",
  medium: "#ff632a",
  low: "#e951f1",
};

/* ─── Dot colors by height ─── */

const DOT_COLORS: Record<ShotInstance["height"], string> = {
  medium: "#ff632a",
  high: "#7c2aff",
  low: "#e951f1",
};

/* ─── Arrow icons for height markers ─── */

function UpArrow() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ display: "block" }}>
      <path d="M4 1L7 5H1L4 1Z" fill="white" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ display: "block" }}>
      <path d="M4 7L1 3H7L4 7Z" fill="white" />
    </svg>
  );
}

/* ─── Video transport button ─── */

function TransportButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "rgba(255,255,255,0.2)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white",
        fontSize: 16,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      aria-label={typeof children === "string" ? children : "transport control"}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */

export function ShotDetailSheet({
  isOpen,
  onClose,
  shotName,
  shotCount,
  avgEff,
  avgAccuracy,
  shots,
  videoSrc,
  hasLength = false,
  hasHeight = false,
  narrative,
  hideVideo = false,
}: ShotDetailSheetProps) {
  const [accuracyFilter, setAccuracyFilter] = useState<AccuracyFilter>("all");
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("all");
  const [heightFilter, setHeightFilter] = useState<HeightFilter>("all");
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rendered, setRendered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Manage mount/unmount animation
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      // Trigger slide-up on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset filters when opening with new shot
  useEffect(() => {
    if (isOpen) {
      setAccuracyFilter("all");
      setLengthFilter("all");
      setHeightFilter("all");
      setCurrentShotIndex(0);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, shotName]);

  const cycleAccuracy = useCallback(() => {
    setAccuracyFilter((prev) => {
      const idx = ACCURACY_OPTIONS.indexOf(prev);
      return ACCURACY_OPTIONS[(idx + 1) % ACCURACY_OPTIONS.length];
    });
  }, []);

  const cycleLength = useCallback(() => {
    setLengthFilter((prev) => {
      const idx = LENGTH_OPTIONS.indexOf(prev);
      return LENGTH_OPTIONS[(idx + 1) % LENGTH_OPTIONS.length];
    });
  }, []);

  const cycleHeight = useCallback(() => {
    setHeightFilter((prev) => {
      const idx = HEIGHT_OPTIONS.indexOf(prev);
      return HEIGHT_OPTIONS[(idx + 1) % HEIGHT_OPTIONS.length];
    });
  }, []);

  // Filter shots
  const filteredShots = shots.filter((s) => {
    if (accuracyFilter !== "all" && s.accuracy !== accuracyFilter) return false;
    if (hasLength && lengthFilter !== "all" && s.length !== lengthFilter) return false;
    if (heightFilter !== "all" && s.height !== heightFilter) return false;
    return true;
  });

  const handlePrev = useCallback(() => {
    setCurrentShotIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentShotIndex((i) => Math.min(filteredShots.length - 1, i + 1));
  }, [filteredShots.length]);

  if (!rendered) return null;

  /* ─── Court dimensions for scatter ─── */
  const COURT_SVG_W = 300;
  const COURT_SVG_H = 400;
  const COURT_PAD = 16;
  const INNER_W = COURT_SVG_W - COURT_PAD * 2;
  const INNER_H = COURT_SVG_H - COURT_PAD * 2;

  return (
    <>
      {/* Overlay */}
      <div
        className="shot-detail-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(0,0,0,0.5)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: visible ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Container: close button + sheet */}
      <div
        className="shot-detail-container"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${shotName} shot details`}
      >
        {/* Floating close button */}
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 99999,
            background: "rgba(255,255,255,0.56)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            pointerEvents: "auto",
          }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="5" x2="15" y2="15" />
            <line x1="15" y1="5" x2="5" y2="15" />
          </svg>
        </button>

        {/* Sheet */}
        <div
          style={{
            width: "100%",
            height: "90dvh",
            background: "var(--bg-elv-1, #fafafa)",
            borderRadius: "20px 20px 0 0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
          }}
        >
        {/* ─── Fixed top: Header + Video ─── */}
        <div style={{ flexShrink: 0 }}>
          {/* Section label header */}
          <div
            style={{
              padding: "16px 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: "#282520", letterSpacing: "-0.3px" }}>
              {shotName}
            </span>
            <span style={{ fontSize: 14, fontWeight: 300, color: "#7d7971" }}>
              {shotCount}X
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--brand-orange, #fa642d)" }} />
          </div>

          {/* Video player (fixed at top) — hidden on desktop */}
          {!hideVideo && <div
            style={{
              margin: "12px 0 0",
              background: "#1a1a1a",
              borderRadius: 0,
              overflow: "hidden",
              position: "sticky",
              top: 0,
              zIndex: 5,
              aspectRatio: "16/10",
            }}
          >
            {/* Video element */}
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onLoadedMetadata={() => {
                  // Seek to first filtered shot's timestamp
                  const firstTime = filteredShots[0]?.videoTime;
                  if (videoRef.current && firstTime != null) {
                    videoRef.current.currentTime = firstTime;
                  }
                }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 28, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}

            {/* Transport controls */}
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <TransportButton onClick={() => {
                const prevIdx = Math.max(0, currentShotIndex - 1);
                setCurrentShotIndex(prevIdx);
                const t = filteredShots[prevIdx]?.videoTime;
                if (videoRef.current && t != null) videoRef.current.currentTime = t;
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="2" y="3" width="2" height="10" /><path d="M14 3L6 8l8 5V3z" /></svg>
              </TransportButton>
              <TransportButton onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) videoRef.current.play();
                  else videoRef.current.pause();
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="white"><rect x="3" y="3" width="3.5" height="10" rx="0.5" /><rect x="9.5" y="3" width="3.5" height="10" rx="0.5" /></svg>
              </TransportButton>
              <TransportButton onClick={() => {
                const nextIdx = Math.min(filteredShots.length - 1, currentShotIndex + 1);
                setCurrentShotIndex(nextIdx);
                const t = filteredShots[nextIdx]?.videoTime;
                if (videoRef.current && t != null) videoRef.current.currentTime = t;
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="12" y="3" width="2" height="10" /><path d="M2 3l8 5-8 5V3z" /></svg>
              </TransportButton>
            </div>

            {/* Timeline with shot tick marks */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, padding: "0 12px", display: "flex", alignItems: "center", background: "rgba(0,0,0,0.5)" }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2, position: "relative" }}>
                {/* Tick marks for each FILTERED shot instance */}
                {filteredShots.map((shot, i) => {
                  const ts = shot.videoTime ?? 0;
                  const duration = videoRef.current?.duration || 2377;
                  const tickPos = ts / duration;
                  const isActive = i === currentShotIndex;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentShotIndex(i);
                        if (videoRef.current && shot.videoTime != null) videoRef.current.currentTime = shot.videoTime;
                      }}
                      style={{
                        position: "absolute",
                        left: `${tickPos * 100}%`,
                        top: -3,
                        width: isActive ? 4 : 2,
                        height: isActive ? 10 : 8,
                        background: isActive ? "#fa642d" : "rgba(255,255,255,0.6)",
                        borderRadius: 2,
                        transform: "translateX(-1px)",
                        cursor: "pointer",
                        zIndex: isActive ? 2 : 1,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Shot counter */}
            <div style={{ position: "absolute", top: 8, right: 12, fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 10 }}>
              {currentShotIndex + 1}/{filteredShots.length}
            </div>
          </div>}
        </div>{/* end fixed top */}

        {/* ─── Scrollable content ─── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            padding: "0 12px 32px",
          }}
        >

          {/* ─── Narrative ─── */}
          {narrative && (
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "-1px",
                color: "var(--text-heading, #161616)",
                marginTop: 16,
                fontFamily: "var(--font-dm-sans)",
              }}
              data-narrative
            >
              {narrative}
            </p>
          )}

          {/* ─── Stats row ─── */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#eeeeee",
                borderRadius: 8,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: avgEff >= 65 ? "#2dbd1a" : avgEff >= 45 ? "#f59e0b" : "#ff4e64",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                {avgEff}%
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: "#888",
                  marginTop: 4,
                  lineHeight: 1.3,
                }}
              >
                Avg. Effectiveness
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#eeeeee",
                borderRadius: 8,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: avgAccuracy >= 65 ? "#2dbd1a" : avgAccuracy >= 45 ? "#f59e0b" : "#ff4e64",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                {avgAccuracy}%
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: "#888",
                  marginTop: 4,
                  lineHeight: 1.3,
                }}
              >
                Avg. Accuracy
              </div>
            </div>
          </div>

          {/* ─── Filter dropdowns — above court ─── */}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: 6, textAlign: "center" }}>ACCURACY</div>
              <select value={accuracyFilter} onChange={(e) => setAccuracyFilter(e.target.value as AccuracyFilter)} style={{ width: "100%", background: "#f6f6f6", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 8px", fontSize: 12, fontWeight: 500, color: "#444", appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer" }}>
                <option value="all">All</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="bad">Bad</option>
              </select>
            </div>
            {/* LENGTH — only shown for shots that have length data */}
            {hasLength && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: 6, textAlign: "center" }}>LENGTH</div>
                <select value={lengthFilter} onChange={(e) => setLengthFilter(e.target.value as LengthFilter)} style={{ width: "100%", background: "#f6f6f6", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 8px", fontSize: 12, fontWeight: 500, color: "#444", appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer" }}>
                  <option value="all">All</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="bad">Bad</option>
                </select>
              </div>
            )}
            {/* HEIGHT — only shown for shots that have height data (lifts/clears) */}
            {hasHeight && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#999", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: 6, textAlign: "center" }}>HEIGHT</div>
                <select value={heightFilter} onChange={(e) => setHeightFilter(e.target.value as HeightFilter)} style={{ width: "100%", background: "#f6f6f6", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 8px", fontSize: 12, fontWeight: 500, color: "#444", appearance: "none" as const, WebkitAppearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer" }}>
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 4, marginBottom: 0 }}>
            {filteredShots.length} of {shots.length} shots shown
          </div>

          {/* ─── 3D Shot scatter court ─── */}
          <div style={{ marginTop: 8 }}>
            {/* 3D Court — opponent half only */}
            <div style={{ margin: "0 auto", maxWidth: 300, padding: "0 20px", width: "100%" }}>
              <div style={{
                position: "relative",
              }}>
                {/* ACCURACY label + bar — inside 3D transform so it matches court width */}
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: 4 }}>
                  ACCURACY
                </div>
                <div style={{ margin: "0 10%", height: 4, borderRadius: 2, background: "linear-gradient(90deg, #58ed13 0%, #f2ef2c 25%, #f21e1e 50%, #f2ef2c 75%, #58ed13 100%)", marginBottom: 4 }} />
                {/* Court surface — half court */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "85%", /* wider aspect for half court */
                  background: "#4a9e3f",
                  borderRadius: 4,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                  overflow: "visible",
                }}>
                  {/* Court lines SVG — opponent half only */}
                  <svg viewBox="0 0 200 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    {/* Outer boundary */}
                    <rect x="8" y="8" width="184" height="144" fill="none" stroke="white" strokeWidth="2" opacity="0.85" />
                    {/* Singles sidelines */}
                    <line x1="20" y1="8" x2="20" y2="152" stroke="white" strokeWidth="1.5" opacity="0.7" />
                    <line x1="180" y1="8" x2="180" y2="152" stroke="white" strokeWidth="1.5" opacity="0.7" />
                    {/* Center line */}
                    <line x1="100" y1="8" x2="100" y2="152" stroke="white" strokeWidth="1.5" opacity="0.6" />
                    {/* Short service line */}
                    <line x1="20" y1="60" x2="180" y2="60" stroke="white" strokeWidth="1.2" opacity="0.5" />
                    {/* Long service line */}
                    <line x1="8" y1="22" x2="192" y2="22" stroke="white" strokeWidth="1" opacity="0.4" />
                    {/* Net at bottom */}
                    <line x1="0" y1="152" x2="200" y2="152" stroke="white" strokeWidth="3" opacity="0.9" />
                    <text x="100" y="148" textAnchor="middle" fontSize="7" fill="white" opacity="0.5">Net</text>
                  </svg>

                  {/* Length side bracket indicators */}
                  {(() => {
                    if (!hasLength) return null;
                    const { zone, lengthType } = getShotLandingInfo(shotName);
                    if (lengthType === "none") return null;
                    const zr = OPPONENT_ZONES[zone];
                    if (!zr) return null;

                    const zt = parseFloat(zr.top);
                    const zh = parseFloat(zr.height);

                    // Drop: good near net (bottom), bad far (top)
                    // Lift: good near back (top), bad short (bottom)
                    const bands = lengthType === "drop"
                      ? [
                          { key: "bad", color: "#e53e3e", top: zt, height: zh * 0.35 },
                          { key: "average", color: "#f59e0b", top: zt + zh * 0.35, height: zh * 0.30 },
                          { key: "good", color: "#22c55e", top: zt + zh * 0.65, height: zh * 0.35 },
                        ]
                      : [
                          { key: "good", color: "#22c55e", top: zt, height: zh * 0.35 },
                          { key: "average", color: "#f59e0b", top: zt + zh * 0.35, height: zh * 0.30 },
                          { key: "bad", color: "#e53e3e", top: zt + zh * 0.65, height: zh * 0.35 },
                        ];

                    const bracketWidth = 4;
                    const labelTexts = lengthType === "drop"
                      ? ["Bad", "Avg", "Good"]
                      : ["Good", "Avg", "Bad"];

                    return (
                      <>
                        {/* Left side brackets + "LENGTH" label */}
                        <div style={{ position: "absolute", left: -24, top: 0, bottom: 0, width: 20, pointerEvents: "none", zIndex: 6 }}>
                          {bands.map((band, bi) => {
                            if (lengthFilter !== "all" && lengthFilter !== band.key) return null;
                            const opacity = lengthFilter === band.key ? 1 : 0.6;
                            return (
                              <div key={band.key} style={{ position: "absolute", top: `${band.top}%`, height: `${band.height}%`, left: 2, width: bracketWidth }}>
                                {/* Bracket: top cap + vertical line + bottom cap */}
                                <div style={{ position: "absolute", top: 0, left: 0, width: bracketWidth + 4, height: 1.5, background: band.color, opacity }} />
                                <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 1.5, background: band.color, opacity }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, width: bracketWidth + 4, height: 1.5, background: band.color, opacity }} />
                              </div>
                            );
                          })}
                          {/* "LENGTH" vertical text */}
                          <div style={{
                            position: "absolute",
                            top: `${zt}%`,
                            height: `${zh}%`,
                            left: -14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            writingMode: "vertical-rl" as any,
                            transform: "rotate(180deg)",
                            fontSize: 8,
                            fontWeight: 700,
                            color: "#999",
                            letterSpacing: "1.5px",
                          }}>
                            LENGTH
                          </div>
                        </div>

                        {/* Right side brackets + "LENGTH" label */}
                        <div style={{ position: "absolute", right: -24, top: 0, bottom: 0, width: 20, pointerEvents: "none", zIndex: 6 }}>
                          {bands.map((band, bi) => {
                            if (lengthFilter !== "all" && lengthFilter !== band.key) return null;
                            const opacity = lengthFilter === band.key ? 1 : 0.6;
                            return (
                              <div key={band.key} style={{ position: "absolute", top: `${band.top}%`, height: `${band.height}%`, right: 2, width: bracketWidth }}>
                                <div style={{ position: "absolute", top: 0, right: 0, width: bracketWidth + 4, height: 1.5, background: band.color, opacity }} />
                                <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 1.5, background: band.color, opacity }} />
                                <div style={{ position: "absolute", bottom: 0, right: 0, width: bracketWidth + 4, height: 1.5, background: band.color, opacity }} />
                              </div>
                            );
                          })}
                          <div style={{
                            position: "absolute",
                            top: `${zt}%`,
                            height: `${zh}%`,
                            right: -14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            writingMode: "vertical-rl" as any,
                            fontSize: 8,
                            fontWeight: 700,
                            color: "#999",
                            letterSpacing: "1.5px",
                          }}>
                            LENGTH
                          </div>
                        </div>

                        {/* Subtle horizontal zone lines on court */}
                        {bands.map((band) => {
                          if (lengthFilter !== "all" && lengthFilter !== band.key) return null;
                          return (
                            <div key={`line-${band.key}`} style={{
                              position: "absolute",
                              top: `${band.top + band.height}%`,
                              left: "10%",
                              right: "10%",
                              height: 1,
                              background: band.color,
                              opacity: 0.25,
                              pointerEvents: "none",
                            }} />
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Shot dots — active instance highlighted, others greyed */}
                  {filteredShots.map((shot, i) => {
                    const isActive = i === currentShotIndex;
                    const color = DOT_COLORS[shot.height];
                    const dotSize = isActive ? 24 : 18;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setCurrentShotIndex(i);
                          const t = shot.videoTime;
                          if (videoRef.current && t != null) videoRef.current.currentTime = t;
                        }}
                        style={{
                          position: "absolute",
                          left: `${courtX(shot.x)}%`,
                          top: `${courtY(shot.y)}%`,
                          width: dotSize,
                          height: dotSize,
                          borderRadius: "50%",
                          background: isActive ? color : "#999",
                          transform: "translate(-50%, -50%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isActive
                            ? `inset 0 2px 4px rgba(255,255,255,0.3), 0 0 10px ${color}80, 0 2px 8px rgba(0,0,0,0.3)`
                            : "none",
                          border: isActive ? "2px solid white" : "1px solid rgba(255,255,255,0.2)",
                          opacity: isActive ? 1 : 0.35,
                          zIndex: isActive ? 10 : 5,
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                      >
                        {shot.height === "high" && <UpArrow />}
                        {shot.height === "low" && <DownArrow />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* filters moved above court */}
        </div>
      </div>{/* end sheet */}
      </div>{/* end container */}
    </>
  );
}
