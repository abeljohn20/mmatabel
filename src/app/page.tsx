"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { TabId } from "@/lib/types";
import { SectionNavigator } from "@/components/SectionNavigator";
import { useIsDesktop } from "@/lib/useIsDesktop";

import { ShotArsenalTab } from "@/components/tabs/ShotArsenalTab";
import { OpeningPhaseTab } from "@/components/tabs/OpeningPhaseTab";
import { PatternsTab } from "@/components/tabs/PatternsTab";
import { DecisionAnalysisTab } from "@/components/tabs/DecisionAnalysisTab";
import { HeadToHeadTab } from "@/components/tabs/HeadToHeadTab";

import { VideoSheet } from "@/components/VideoSheet";
import type { VideoSheetData } from "@/components/VideoSheet";
import { DesktopVideoPanel } from "@/components/DesktopVideoPanel";

const TABS: { id: TabId; label: string }[] = [
  { id: "arsenal", label: "Shot Arsenal" },
  { id: "opening", label: "Opening Phase" },
  { id: "patterns", label: "Patterns" },
  { id: "decisions", label: "Decision Analysis" },
  { id: "h2h", label: "Head To Head" },
];

const MATCH_FILES = [
  { id: "20251012_151701", label: "Match 12 Oct (54 rallies, 2 games)" },
  { id: "Lakshya_3tag", label: "Lakshya (108 rallies)" },
  { id: "Varshan_820", label: "Varshan (54 rallies)" },
  { id: "Harshan_793", label: "Harshan (46 rallies)" },
  { id: "Adhithya_799", label: "Adhithya (43 rallies)" },
];

export default function Home() {
  const [matchIdx, setMatchIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("arsenal");
  const [analysisView, setAnalysisView] = useState<"your" | "opponent">("your");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [report, setReport] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [narrative, setNarrative] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoSheet, setVideoSheet] = useState<VideoSheetData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const TAB_SECTIONS: Record<string, { id: string; label: string }[]> = useMemo(() => ({
    opening: [
      { id: "SERVE PREDICTABILITY", label: "SERVE PREDICTABILITY" },
      { id: "SERVE INSIGHT", label: "SERVE INSIGHT" },
      { id: "RECEIVE GAME", label: "RECEIVE GAME" },
      { id: "RECEIVE PREDICTABILITY", label: "RECEIVE PREDICTABILITY" },
      { id: "RECEIVE INSIGHT", label: "RECEIVE INSIGHT" },
      { id: "WINNING OPENINGS", label: "WINNING OPENINGS" },
      { id: "LOSING OPENINGS", label: "LOSING OPENINGS" },
    ],
    patterns: [
      { id: "RALLY LENGTH", label: "RALLY LENGTH" },
      { id: "MATCH PHASES", label: "MATCH PHASES" },
      { id: "TEMPO CONTROL", label: "TEMPO CONTROL" },
      { id: "PREDICTABLE PATTERNS", label: "PREDICTABLE PATTERNS" },
      { id: "WINNING PATTERNS", label: "WINNING PATTERNS" },
      { id: "LOSING PATTERNS", label: "LOSING PATTERNS" },
    ],
    decisions: [
      { id: "SHOT CHOICE ISSUES", label: "SHOT CHOICE ISSUES" },
      { id: "RALLY BLUEPRINT", label: "RALLY BLUEPRINT" },
      { id: "OUTCOME PROXIMITY", label: "OUTCOME PROXIMITY" },
      { id: "POST SHOT RECOVERY", label: "POST SHOT RECOVERY" },
      { id: "ADAPTIVE PERFORMANCE", label: "ADAPTIVE PERFORMANCE" },
    ],
    h2h: [
      { id: "WINNER ERROR BALANCE", label: "WINNER ERROR BALANCE" },
      { id: "RALLY LENGTH ADVANTAGE", label: "RALLY LENGTH ADVANTAGE" },
      { id: "STYLE COMPARISON", label: "STYLE COMPARISON" },
    ],
  }), []);

  const currentSections = TAB_SECTIONS[activeTab] || [];
  const tabIds = useMemo(() => TABS.map(t => t.id), []);

  function openVideoSheet(data: VideoSheetData) {
    setVideoSheet(data);
  }

  // ─── Swipe between tabs (mobile only) ───
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    touchStart.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || dt > 400) return;
    const currentIdx = tabIds.indexOf(activeTab);
    if (dx < 0 && currentIdx < tabIds.length - 1) setActiveTab(tabIds[currentIdx + 1]);
    else if (dx > 0 && currentIdx > 0) setActiveTab(tabIds[currentIdx - 1]);
  }, [activeTab, tabIds]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector(`[data-tab-active="true"]`) as HTMLElement;
    if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  // Fetch match data
  useEffect(() => {
    const id = MATCH_FILES[matchIdx].id;
    setLoading(true);
    Promise.all([
      fetch(`/data/${id}_v4_report.json`).then((r) => r.json()),
      fetch(`/data/${id}_narrative.json`).then((r) => r.json()),
    ]).then(([r, n]) => {
      setReport(r);
      setNarrative(n);
      setLoading(false);
    });
  }, [matchIdx]);

  /* ─── Mobile shell (header + tabs + toggle + content) ─── */
  const mobileShell = (
    <div style={{
      width: "100%",
      maxWidth: isDesktop ? 480 : undefined,
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      background: "white",
      borderLeft: isDesktop ? "1px solid #eee" : undefined,
    }}>
      {/* Header */}
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 14 }}>‹</span>
          <span style={{ fontSize: 12 }}>Back</span>
        </div>
        <select
          value={matchIdx}
          onChange={(e) => setMatchIdx(Number(e.target.value))}
          style={{ fontSize: 12, border: "none", color: "#6d6d6d" }}
        >
          {MATCH_FILES.map((m, i) => (
            <option key={m.id} value={i}>{m.id}</option>
          ))}
        </select>
      </div>

      {/* Tab Bar */}
      <div
        ref={tabBarRef}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          padding: "10px 12px",
          overflowX: "auto",
          background: "white",
          borderBottom: "1px solid #eee",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none" as any,
          msOverflowStyle: "none" as any,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              data-tab-active={isActive ? "true" : "false"}
              onPointerDown={() => setActiveTab(tab.id)}
              style={{
                whiteSpace: "nowrap",
                flexShrink: 0,
                padding: "8px 0",
                fontSize: isActive ? 17 : 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#322e27" : "#908c83",
                borderBottom: isActive ? "2px solid #fa642d" : "2px solid transparent",
                cursor: "pointer",
                WebkitTapHighlightColor: "rgba(0,0,0,0.05)",
                userSelect: "none",
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* Your / Opponent Analysis toggle */}
      {activeTab !== "report" && activeTab !== "h2h" && (
        <div style={{ display: "flex", gap: 0, padding: "6px 16px", background: "#fafafa", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", background: "#eeeeee", borderRadius: 8, padding: 3 }}>
            {(["your", "opponent"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setAnalysisView(view)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, border: "none", fontSize: 13,
                  fontWeight: analysisView === view ? 500 : 400,
                  color: analysisView === view ? "#322e27" : "#908c83",
                  background: analysisView === view ? "white" : "transparent",
                  boxShadow: analysisView === view ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer", transition: "all 0.2s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {view === "your" ? "Your Analysis" : "Opponent Analysis"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ flex: 1, minHeight: 0, background: activeTab === "arsenal" ? "#f8f9fa" : "#fafafa", overflowY: activeTab === "arsenal" ? "hidden" : "auto" }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>
        ) : (
          <>
            {activeTab === "arsenal" && <ShotArsenalTab analysisView={analysisView} />}
            {activeTab !== "arsenal" && (
              <SectionNavigator sections={currentSections} contentRef={contentRef}>
                {activeTab === "opening" && <OpeningPhaseTab analysisView={analysisView} onOpenVideo={openVideoSheet} />}
                {activeTab === "patterns" && <PatternsTab analysisView={analysisView} onOpenVideo={openVideoSheet} narrative={narrative} />}
                {activeTab === "decisions" && <DecisionAnalysisTab analysisView={analysisView} narrative={narrative} onOpenVideo={openVideoSheet} />}
                {activeTab === "h2h" && <HeadToHeadTab report={report} narrative={narrative} onOpenVideo={openVideoSheet} />}
              </SectionNavigator>
            )}
          </>
        )}
      </div>
    </div>
  );

  const videoSheetBlock = (
    <VideoSheet
      isOpen={videoSheet !== null}
      onClose={() => setVideoSheet(null)}
      title={videoSheet?.title ?? ""}
      subtitle={videoSheet?.subtitle}
      description={videoSheet?.description}
      videoSrc="/match-video.mp4"
      timestamps={videoSheet?.timestamps ?? []}
      streakRanges={videoSheet?.streakRanges}
      sectionLabel={videoSheet?.sectionLabel}
      count={videoSheet?.count}
      steps={videoSheet?.steps}
      badge={videoSheet?.badge}
      badgeBg={videoSheet?.badgeBg}
      badgeBorder={videoSheet?.badgeBorder}
      badgeColor={videoSheet?.badgeColor}
      badges={videoSheet?.badges}
      betterOption={videoSheet?.betterOption}
      betterEff={videoSheet?.betterEff}
      betterEffColor={videoSheet?.betterEffColor}
      shotEff={videoSheet?.shotEff}
      shotEffColor={videoSheet?.shotEffColor}
      diffLabel={videoSheet?.diffLabel}
      gameRuns={videoSheet?.gameRuns}
      gameTotalRallies={videoSheet?.gameTotalRallies}
      hideVideo={isDesktop}
    />
  );

  /* ─── DESKTOP LAYOUT ─── */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", width: "100%", height: "100dvh", overflow: "hidden", background: "#f5f5f5" }}>
        {/* Left: persistent video panel — always visible */}
        <div style={{ flex: "1 1 60%", minWidth: 0 }}>
          <DesktopVideoPanel
            data={videoSheet}
            videoSrc="/match-video.mp4"
            onClose={() => setVideoSheet(null)}
          />
        </div>

        {/* Right: mobile shell + bottom sheet (no video in sheet) */}
        <div style={{
          flex: "0 0 480px",
          maxWidth: 480,
          height: "100dvh",
          overflow: "hidden",
          position: "relative",
        }}>
          {mobileShell}
          {videoSheetBlock}
        </div>
      </div>
    );
  }

  /* ─── MOBILE LAYOUT ─── */
  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", height: "100dvh", background: "white", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {mobileShell}
      {videoSheetBlock}
    </div>
  );
}
