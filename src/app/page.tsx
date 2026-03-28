"use client";

import { useState, useEffect } from "react";
import type { TabId } from "@/lib/types";

import { ShotArsenalTab } from "@/components/tabs/ShotArsenalTab";
import { OpeningPhaseTab } from "@/components/tabs/OpeningPhaseTab";
import { PatternsTab } from "@/components/tabs/PatternsTab";
import { DynamicsTab } from "@/components/tabs/DynamicsTab";
import { HeadToHeadTab } from "@/components/tabs/HeadToHeadTab";

import { VideoSheet } from "@/components/VideoSheet";
import type { VideoSheetData } from "@/components/VideoSheet";

const TABS: { id: TabId; label: string }[] = [
  { id: "arsenal", label: "Shot Arsenal" },
  { id: "opening", label: "Opening Phase" },
  { id: "patterns", label: "Patterns" },
  { id: "dynamics", label: "Dynamics" },
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

  function openVideoSheet(data: VideoSheetData) {
    setVideoSheet(data);
  }

  // Fetch match data from public folder
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

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        height: "100dvh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
        style={{
          display: "flex",
          gap: 16,
          padding: "12px 16px",
          overflowX: "auto",
          background: "white",
          borderBottom: "1px solid #eee",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
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

      {/* Your / Opponent Analysis toggle — fixed below tabs, hidden on Match Report */}
      {activeTab !== "report" && activeTab !== "dynamics" && activeTab !== "h2h" && (
        <div
          style={{
            display: "flex",
            gap: 0,
            padding: "6px 16px",
            background: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              background: "#eeeeee",
              borderRadius: 20,
              padding: 3,
            }}
          >
            {(["your", "opponent"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setAnalysisView(view)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 18,
                  border: "none",
                  fontSize: 13,
                  fontWeight: analysisView === view ? 500 : 400,
                  color: analysisView === view ? "#322e27" : "#908c83",
                  background: analysisView === view ? "white" : "transparent",
                  boxShadow: analysisView === view ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
      <div style={{ flex: 1, minHeight: 0, background: activeTab === "arsenal" ? "#f8f9fa" : "#fafafa", overflowY: activeTab === "arsenal" ? "hidden" : "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>
        ) : (
          <>

            {activeTab === "arsenal" && <ShotArsenalTab analysisView={analysisView} />}
            {activeTab === "opening" && <OpeningPhaseTab analysisView={analysisView} onOpenVideo={openVideoSheet} />}
            {activeTab === "patterns" && <PatternsTab analysisView={analysisView} onOpenVideo={openVideoSheet} />}
            {activeTab === "dynamics" && <DynamicsTab report={report} narrative={narrative} analysisView={analysisView} onOpenVideo={openVideoSheet} />}
            {activeTab === "h2h" && <HeadToHeadTab report={report} narrative={narrative} analysisView={analysisView} />}
          </>
        )}
      </div>

      {/* Video bottom sheet */}
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
      />
    </div>
  );
}
