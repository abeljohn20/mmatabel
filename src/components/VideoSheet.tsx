"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ─── Types ─── */

export interface VideoTimelineRange {
  start: number;   // seconds
  end: number;     // seconds
  type: "player" | "opponent";
  label: string;   // e.g. "11-14 pts"
}

export interface VideoSheetStep {
  who: "You" | "Opp";
  action: string;
  effLabel?: string;
  effColor?: string;
}

export interface VideoSheetData {
  title: string;
  subtitle?: string;
  description?: string;
  timestamps: number[];
  /** Streak ranges — when provided, timeline shows colored blocks instead of ticks */
  streakRanges?: VideoTimelineRange[];
  sectionLabel?: string;
  /** Count label e.g. "10x" */
  count?: string;
  /** Sequence steps to display below description */
  steps?: VideoSheetStep[];
  /** Badge text e.g. "Best receive" */
  badge?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor?: string;
  /** Streak runs for rendering streak bar in bottom sheet */
  gameRuns?: { score: string; type: "player" | "opponent"; length: number; start_rally: number; start_ts?: number | null; end_ts?: number | null }[];
  gameTotalRallies?: number;
  /** Shot comparison — "better option" info */
  betterOption?: string;
  betterEff?: string;
  betterEffColor?: string;
  shotEff?: string;
  shotEffColor?: string;
  diffLabel?: string;
}

interface VideoSheetProps extends VideoSheetData {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

/* ─── Transport button ─── */

function TransportButton({
  children,
  onClick,
  label,
  size = 40,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: "rgba(43,42,42,0.5)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white",
        fontSize: 16,
      }}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */

export function VideoSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  videoSrc,
  timestamps,
  streakRanges,
  sectionLabel,
  count,
  steps,
  gameRuns,
  gameTotalRallies,
  badge,
  badgeBg,
  badgeBorder,
  badgeColor,
  betterOption,
  betterEff,
  betterEffColor,
  shotEff,
  shotEffColor,
  diffLabel,
}: VideoSheetProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen, title]);

  const seekTo = useCallback(
    (index: number) => {
      if (videoRef.current && timestamps[index] != null) {
        videoRef.current.currentTime = timestamps[index];
      }
    },
    [timestamps]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.max(0, i - 1);
      if (videoRef.current && timestamps[next] != null)
        videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(timestamps.length - 1, i + 1);
      if (videoRef.current && timestamps[next] != null)
        videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, []);

  if (!rendered) return null;

  const hasStreakRanges = streakRanges && streakRanges.length > 0;
  const videoDuration = videoRef.current?.duration || 2377;

  const subtitleColor = (() => {
    if (!subtitle) return "#888";
    const num = parseFloat(subtitle);
    if (isNaN(num)) return "#888";
    if (num >= 60) return "#2dbd1a";
    if (num >= 45) return "#f59e0b";
    return "#ff4e64";
  })();

  return (
    <>
      {/* Overlay */}
      <div
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
        aria-label={`${title} video`}
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
            background: "var(--bg-elv-1, #fafafa)",
            borderRadius: "20px 20px 0 0",
            width: "100%",
            height: "90dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
          }}
        >
          {/* ─── FIXED TOP: Section label + Video ─── */}
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
              {sectionLabel && (
                <>
                  <Image src="/icons/timeline-orange.svg" alt="" width={24} height={24} />
                  <span
                    style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--grey-450, #6b6760)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {sectionLabel}
                </span>
              </>
            )}
            <div style={{ flex: 1, height: 1, background: "var(--brand-orange, #fa642d)" }} />
          </div>

            {/* Video player (fixed) */}
            <div
              style={{
                background: "#363636",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "16/9",
                margin: "12px 0 0",
              }}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onLoadedMetadata={() => seekTo(0)}
              />

              {/* Transport controls */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  transform: "translateY(-60%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                }}
              >
                <TransportButton onClick={handlePrev} label="Previous instance" size={36}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
                    <rect x="2" y="3" width="2" height="10" />
                    <path d="M14 3L6 8l8 5V3z" />
                  </svg>
                </TransportButton>
                <TransportButton onClick={handlePlayPause} label="Play or pause" size={48}>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
                    <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
                    <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
                  </svg>
                </TransportButton>
                <TransportButton onClick={handleNext} label="Next instance" size={36}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
                    <rect x="12" y="3" width="2" height="10" />
                    <path d="M2 3l8 5-8 5V3z" />
                  </svg>
                </TransportButton>
              </div>

              {/* Timeline bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(214,214,214,0.58)",
                    borderRadius: 20,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* Progress fill */}
                  {!hasStreakRanges && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: 4,
                        width: `${((timestamps[currentIndex] || 0) / videoDuration) * 100}%`,
                        background: "white",
                        borderRadius: 20,
                      }}
                    />
                  )}

                  {/* Streak range blocks on the timeline */}
                  {hasStreakRanges && streakRanges.map((range, i) => {
                    const leftPct = (range.start / videoDuration) * 100;
                    const widthPct = ((range.end - range.start) / videoDuration) * 100;
                    const isPlayer = range.type === "player";
                    const color = isPlayer ? "#3e95f3" : "#f5364d";

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          // Find the closest timestamp within this range
                          const closest = timestamps.reduce((best, ts, idx) =>
                            ts >= range.start && ts <= range.end ? idx : best, 0
                          );
                          setCurrentIndex(closest);
                          if (videoRef.current) videoRef.current.currentTime = range.start;
                        }}
                        style={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          top: -3,
                          width: `${Math.max(widthPct, 2)}%`,
                          height: 10,
                          background: color,
                          borderRadius: 15,
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Instance tick marks (only when no streak ranges) */}
              {!hasStreakRanges && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 12,
                    right: 12,
                    height: 24,
                  }}
                >
                  {timestamps.map((ts, i) => {
                    const pos = (ts / videoDuration) * 100;
                    const isActive = i === currentIndex;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setCurrentIndex(i);
                          seekTo(i);
                        }}
                        style={{
                          position: "absolute",
                          left: `${pos}%`,
                          bottom: 5,
                          width: 4,
                          height: 14,
                          background: isActive ? "#ec5e26" : "white",
                          borderRadius: 15,
                          transform: "translateX(-2px)",
                          cursor: "pointer",
                          zIndex: isActive ? 2 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Shot counter */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 12,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(0,0,0,0.4)",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {currentIndex + 1}/{timestamps.length}
              </div>
            </div>
          </div>{/* end fixed top */}

          {/* ─── SCROLLABLE CONTENT ─── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              paddingBottom: 32,
            }}
          >
            {/* Title + subtitle row */}
            <div style={{ padding: "20px 16px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-heading, #161616)",
                    letterSpacing: "-1px",
                    lineHeight: 1.2,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {title}
                </span>
                {subtitle && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: subtitleColor,
                      letterSpacing: "-0.4px",
                      lineHeight: 1.32,
                      flexShrink: 0,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {subtitle}
                  </span>
                )}
                {count && (
                  <>
                    <span style={{ fontSize: 12, color: "#868686", margin: "0 4px" }}>•</span>
                    <span style={{ fontSize: 14, color: "#868686", fontFamily: "var(--font-dm-sans)" }}>{count}</span>
                  </>
                )}
              </div>

              {description && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: "var(--text-subtext, #6d6d6d)",
                    marginTop: 4,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {description}
                </p>
              )}

              {/* Sequence steps */}
              {steps && steps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {steps.map((step, i) => {
                    const isYou = step.who === "You";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "0 8px", borderRadius: 4,
                            backgroundColor: isYou ? "#dee5ff" : "#fcd4d9",
                          }}>
                            <span style={{ fontSize: 12, lineHeight: 1.6, color: isYou ? "#6141ef" : "#a22618", fontFamily: "var(--font-dm-sans)" }}>{step.who}</span>
                          </div>
                          <span style={{ fontSize: 12, color: "#000", fontFamily: "var(--font-dm-sans)" }}>{step.action}</span>
                        </div>
                        {step.effLabel && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: step.effColor || "#868686", fontFamily: "var(--font-dm-sans)" }}>{step.effLabel}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shot comparison (better option) */}
              {betterOption && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elv-2, #f6f6f6)", padding: 8, borderRadius: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 12, color: "var(--text-subtext, #6d6d6d)", fontWeight: 300, fontFamily: "var(--font-dm-sans)" }}>Shot you played</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#3e3a32", fontFamily: "var(--font-dm-sans)" }}>{title}</span>
                    </div>
                    {shotEff && <span style={{ fontSize: 14, fontWeight: 500, color: shotEffColor || "#eb3030", fontFamily: "var(--font-dm-sans)" }}>{shotEff}</span>}
                  </div>
                  {diffLabel && <p style={{ fontSize: 12, color: "#5c5850", textAlign: "center", fontFamily: "var(--font-dm-sans)" }}>{diffLabel}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.57)", padding: 8, borderRadius: 8, border: "1px solid #eee", boxShadow: "0px 4px 4px rgba(215,215,215,0.29)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 12, color: "var(--text-subtext, #6d6d6d)", fontWeight: 300, fontFamily: "var(--font-dm-sans)" }}>Better option</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#3e3a32", fontFamily: "var(--font-dm-sans)" }}>{betterOption}</span>
                    </div>
                    {betterEff && <span style={{ fontSize: 14, fontWeight: 500, color: betterEffColor || "#27e72e", fontFamily: "var(--font-dm-sans)" }}>{betterEff}</span>}
                  </div>
                </div>
              )}

              {/* Badge */}
              {badge && (
                <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, backgroundColor: badgeBg || "rgba(117,235,62,0.19)", border: `1px solid ${badgeBorder || "#bdf6c0"}` }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: badgeColor || "#359707", fontFamily: "var(--font-dm-sans)" }}>{badge}</span>
                  </div>
                </div>
              )}

              {/* Streak bar */}
              {gameRuns && gameRuns.length > 0 && (() => {
                const total = gameTotalRallies || 40;
                const sorted = [...gameRuns].sort((a, b) => a.start_rally - b.start_rally);
                const segs: { type: "gap" | "player" | "opponent"; flex: number; run?: typeof gameRuns[0] }[] = [];
                let cur = 0;
                for (const run of sorted) {
                  const gap = run.start_rally - cur;
                  if (gap > 0) segs.push({ type: "gap", flex: gap });
                  segs.push({ type: run.type, flex: Math.max(run.length, 3), run });
                  cur = run.start_rally + run.length;
                }
                const trail = total - cur;
                if (trail > 0) segs.push({ type: "gap", flex: trail });

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, backgroundColor: "#dfefff" }}>
                        <span style={{ fontSize: 12, color: "#2990fd", fontFamily: "var(--font-dm-sans)" }}>You</span>
                      </div>
                    </div>
                    {/* Labels above */}
                    <div style={{ display: "flex", width: "100%", minHeight: 18 }}>
                      {segs.map((seg, i) => (
                        <div key={i} style={{ flex: seg.flex, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {seg.type === "player" && seg.run && (
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#3e95f3", whiteSpace: "nowrap", fontFamily: "var(--font-dm-sans)" }}>{seg.run.score} pts</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Bar */}
                    <div style={{ display: "flex", width: "100%", borderRadius: 6, overflow: "hidden", backgroundColor: "#e8e8e8", height: 48 }}>
                      {segs.map((seg, i) => {
                        if (seg.type === "gap") return <div key={i} style={{ flex: seg.flex, backgroundColor: "#e8e8e8" }} />;
                        const isPlayer = seg.type === "player";
                        return (
                          <button key={i} type="button" onClick={() => {
                            if (seg.run) {
                              const ts = [seg.run.start_ts, seg.run.end_ts].filter(Boolean) as number[];
                              if (ts.length > 0 && videoRef.current) {
                                videoRef.current.currentTime = ts[0];
                              }
                            }
                          }} style={{
                            flex: seg.flex, border: "none", borderRadius: 6, height: 48, cursor: "pointer",
                            backgroundColor: isPlayer ? "#3e95f3" : "#f5364d",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                              <path d="M5.33 3.33L12 8L5.33 12.67V3.33Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                    {/* Labels below */}
                    <div style={{ display: "flex", width: "100%", minHeight: 18 }}>
                      {segs.map((seg, i) => (
                        <div key={i} style={{ flex: seg.flex, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {seg.type === "opponent" && seg.run && (
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#f5364d", whiteSpace: "nowrap", fontFamily: "var(--font-dm-sans)" }}>{seg.run.score} pts</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, backgroundColor: "#fcd4d9" }}>
                        <span style={{ fontSize: 12, color: "#a22618", fontFamily: "var(--font-dm-sans)" }}>Opp</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
