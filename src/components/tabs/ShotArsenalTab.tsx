"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ShotDetailSheet } from "@/components/ShotDetailSheet";

/* ─── Types ─── */

type ShotPill = { name: string; count: number; level: "good" | "bad" | "neutral"; eff?: number };
type ZoneData = { eff: number; level: "high" | "mid" | "low" };

type ShotInstanceData = {
  x: number;
  y: number;
  height: "high" | "medium" | "low";
  accuracy: "good" | "average" | "bad";
  length?: "good" | "average" | "bad"; // undefined for smashes, flatgame, drives, pushes
  videoTime: number;
};

const ZONE_KEYS = ["Front left", "Front right", "Mid left", "Mid right", "Back left", "Back right"];
const VIDEO_SRC = "/match-video.mp4";

/* ─── Lazy-load 3D canvas ─── */

const Court3DCanvas = dynamic(() => import("@/components/Court3D").then((m) => m.Court3DCanvas), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Loading 3D court…</span>
    </div>
  ),
});

/* ─── Stadium background elements ─── */
function StadiumBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Stadium lights — warm glow on light bg */}
      <div style={{
        position: "absolute", top: -30, left: "10%",
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,240,200,0.4) 0%, rgba(255,230,180,0.1) 50%, transparent 70%)",
        filter: "blur(15px)",
      }} />
      <div style={{
        position: "absolute", top: -20, right: "5%",
        width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,240,200,0.35) 0%, rgba(255,230,180,0.08) 50%, transparent 70%)",
        filter: "blur(18px)",
      }} />

      {/* Stadium stands — subtle light silhouettes */}
      <svg viewBox="0 0 200 300" style={{ position: "absolute", left: -30, top: 80, width: 120, height: "55%", opacity: 0.06 }}>
        <path d="M0,300 L0,80 Q20,60 40,70 L60,90 Q80,100 100,95 L120,100 Q140,110 160,105 L200,120 L200,300 Z" fill="#4a5568" />
        {Array.from({length: 20}).map((_, i) => (
          <circle key={i} cx={15 + (i % 5) * 35} cy={130 + Math.floor(i / 5) * 35 + (i % 3) * 8} r={2.5 + (i % 2)} fill="#718096" opacity={0.5} />
        ))}
      </svg>
      <svg viewBox="0 0 200 300" style={{ position: "absolute", right: -30, top: 70, width: 120, height: "55%", opacity: 0.06, transform: "scaleX(-1)" }}>
        <path d="M0,300 L0,80 Q20,60 40,70 L60,90 Q80,100 100,95 L120,100 Q140,110 160,105 L200,120 L200,300 Z" fill="#4a5568" />
        {Array.from({length: 20}).map((_, i) => (
          <circle key={i} cx={15 + (i % 5) * 35} cy={130 + Math.floor(i / 5) * 35 + (i % 3) * 8} r={2.5 + (i % 2)} fill="#718096" opacity={0.5} />
        ))}
      </svg>
    </div>
  );
}

/* ─── Main component ─── */

export function ShotArsenalTab({ analysisView = "your" }: { analysisView?: "your" | "opponent" } = {}) {
  const [arsenalData, setArsenalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedShot, setSelectedShot] = useState<{
    name: string;
    count: number;
    eff: number;
  } | null>(null);

  /* Fetch JSON on mount */
  useEffect(() => {
    fetch("/data/shot_arsenal_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => {
        setArsenalData(d.shot_arsenal);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  /* Select active side data based on toggle */
  const activeData = useMemo(() => {
    if (!arsenalData) return null;
    return analysisView === "opponent" ? arsenalData.opponent_analysis : arsenalData.your_analysis;
  }, [arsenalData, analysisView]);

  /* Reset selection when switching views */
  useEffect(() => {
    setSelectedZone(null);
    setSelectedShot(null);
  }, [analysisView]);

  /* Build PLAYER_ZONES from JSON */
  const playerZones: Record<string, ZoneData> = useMemo(() => {
    if (!activeData) return {};
    const zones: Record<string, ZoneData> = {};
    activeData.zone_selection.player_zones.forEach((z: any) => {
      zones[z.zone_name] = { eff: z.effectiveness_pct, level: z.level };
    });
    return zones;
  }, [activeData]);

  /* Build LANDINGS from zone_shot_mapping */
  const landings: Record<string, { avgEff: number; zones: Record<string, ShotPill[]> }> = useMemo(() => {
    if (!activeData) return {};
    const mapping = activeData.zone_shot_mapping;
    const result: Record<string, { avgEff: number; zones: Record<string, ShotPill[]> }> = {};
    for (const playerZone of Object.keys(mapping)) {
      const zoneData = mapping[playerZone];
      const zones: Record<string, ShotPill[]> = {};
      for (const landingZone of ZONE_KEYS) {
        const shots = zoneData.opponent_landing_zones[landingZone] || [];
        zones[landingZone] = shots.map((s: any) => ({
          name: s.shot_name,
          count: s.count,
          level: s.level as "good" | "bad" | "neutral",
          eff: s.avg_eff,
        }));
      }
      result[playerZone] = {
        avgEff: zoneData.avg_effectiveness,
        zones,
      };
    }
    return result;
  }, [activeData]);

  /* Get shot instances from shot_details — with fuzzy name matching */
  const findShotDetail = useCallback(
    (shotName: string) => {
      if (!activeData) return null;
      const details = activeData.shot_details;
      // Exact match first
      if (details[shotName]) return details[shotName];
      // Try case-insensitive
      const lower = shotName.toLowerCase();
      for (const key of Object.keys(details)) {
        if (key.toLowerCase() === lower) return details[key];
      }
      // Try without "Cross" suffix or with it
      for (const key of Object.keys(details)) {
        if (key.replace(/ Cross$/, "") === shotName.replace(/ Cross$/, "")) return details[key];
      }
      return null;
    },
    [activeData]
  );

  const getShotInstances = useCallback(
    (shotName: string): ShotInstanceData[] => {
      const detail = findShotDetail(shotName);
      if (!detail) return [];
      const instances = detail.scatter_court?.shot_instances || [];
      const timestamps = detail.video?.timestamps_seconds || [];
      return instances.map((inst: any, i: number) => ({
        x: inst.x,
        y: inst.y,
        // Map JSON "normal" → our "medium"; default to "medium" if absent
        height: (inst.height === "normal" ? "medium" : inst.height === "high" ? "high" : inst.height === "low" ? "low" : "medium") as "high" | "medium" | "low",
        accuracy: inst.accuracy || "average",
        // Only set length if JSON provides it — undefined means "not applicable" (smashes etc.)
        length: inst.length || undefined,
        videoTime: timestamps[i] ?? 0,
      }));
    },
    [findShotDetail]
  );

  /* Get shot stats from shot_details */
  const getShotStats = useCallback(
    (shotName: string): { avgEff: number; avgAccuracy: number } => {
      const detail = findShotDetail(shotName);
      if (!detail) return { avgEff: 0, avgAccuracy: 0 };
      return {
        avgEff: detail.stats_row?.avg_effectiveness?.value_pct ?? 0,
        avgAccuracy: detail.stats_row?.avg_accuracy?.value_pct ?? 0,
      };
    },
    [findShotDetail]
  );

  /* Check if shot has length data */
  const shotHasLength = useCallback(
    (shotName: string): boolean => {
      const detail = findShotDetail(shotName);
      if (!detail) return false;
      const instances = detail.scatter_court?.shot_instances || [];
      return instances.some((inst: any) => inst.length != null);
    },
    [findShotDetail]
  );

  /* Check if shot has height data */
  const shotHasHeight = useCallback(
    (shotName: string): boolean => {
      const detail = findShotDetail(shotName);
      if (!detail) return false;
      const instances = detail.scatter_court?.shot_instances || [];
      return instances.some((inst: any) => inst.height != null);
    },
    [findShotDetail]
  );

  const landing = selectedZone ? landings[selectedZone] : null;

  /* Headline from JSON, with fallback */
  const headline = useMemo(() => {
    if (!activeData) return "";
    const raw = activeData.headline;
    if (!raw || raw.startsWith("[narrative")) {
      return analysisView === "opponent"
        ? "Opponent shot analysis and zone distribution."
        : "Strong attacking and net game with vulnerable clears.";
    }
    return raw;
  }, [activeData, analysisView]);

  function handleZoneClick(zone: string) {
    setSelectedZone(selectedZone === zone ? null : zone);
  }

  const handleShotClick = useCallback(
    (shotName: string, count: number, eff: number) => {
      setSelectedShot({ name: shotName, count, eff });
    },
    []
  );

  const handleCloseSheet = useCallback(() => {
    setSelectedShot(null);
  }, []);

  /* Loading state */
  if (loading) {
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          background: "linear-gradient(180deg, #f8f9fa 0%, #e8ecf0 25%, #dde4e9 50%, #d0dbd4 75%, #c5d5c8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StadiumBg />
        <span style={{ color: "#6d6d6d", fontSize: 14, fontWeight: 500 }}>Loading...</span>
      </div>
    );
  }

  /* Derive shot detail props */
  const shotStats = selectedShot ? getShotStats(selectedShot.name) : null;
  const shotInstances = selectedShot ? getShotInstances(selectedShot.name) : [];
  const hasLength = selectedShot ? shotHasLength(selectedShot.name) : false;
  const hasHeight = selectedShot ? shotHasHeight(selectedShot.name) : false;

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        background: "linear-gradient(180deg, #f8f9fa 0%, #e8ecf0 25%, #dde4e9 50%, #d0dbd4 75%, #c5d5c8 100%)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Stadium background */}
      <StadiumBg />

      {/* Headline */}
      <h2
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 16px 0",
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "-1px",
          lineHeight: 1.2,
          width: 308,
          color: "#161616",
        }}
      >
        {headline}
      </h2>

      {/* 3D Court — fills remaining space to bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          width: "100%",
          minHeight: 0,
        }}
      >
        {/* Overlay controls — card + back button, just above the court */}
        {selectedZone && (
          <div style={{ position: "absolute", top: 40, left: 0, right: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 16px" }}>
            {/* From / Avg effectiveness card */}
            {landing && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 335,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: 300, color: "#a29e95", lineHeight: 1.6 }}>From</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#6d6d6d", lineHeight: 1.4 }}>{selectedZone}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, fontWeight: 300, color: "#a29e95", lineHeight: 1.6 }}>Avg. effectiveness</p>
                  <p style={{
                    fontSize: 14, fontWeight: 500, lineHeight: 1.4,
                    color: (landing.avgEff ?? 0) >= 65 ? "#2dc535" : (landing.avgEff ?? 0) >= 45 ? "#6d6d6d" : "#d33030",
                  }}>
                    {landing.avgEff}%
                  </p>
                </div>
              </div>
            )}

            {/* Back button */}
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 20,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 500,
                color: "#322e27",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>‹</span> Back to Zone Selection
            </button>
          </div>
        )}
        <Court3DCanvas
          playerZones={playerZones}
          zoneKeys={ZONE_KEYS}
          selectedZone={selectedZone}
          landing={landing}
          onZoneClick={handleZoneClick}
          onShotClick={handleShotClick}
        />
      </div>
      {/* Shot detail bottom sheet */}
      <ShotDetailSheet
        isOpen={selectedShot !== null}
        onClose={handleCloseSheet}
        shotName={selectedShot?.name ?? ""}
        shotCount={selectedShot?.count ?? 0}
        avgEff={shotStats?.avgEff ?? selectedShot?.eff ?? 0}
        avgAccuracy={shotStats?.avgAccuracy ?? 0}
        shots={shotInstances}
        videoSrc={VIDEO_SRC}
        hasLength={hasLength}
        hasHeight={hasHeight}
      />
    </div>
  );
}
