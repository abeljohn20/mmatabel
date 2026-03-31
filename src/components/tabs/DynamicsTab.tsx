"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { MatchReport, Narrative } from "@/lib/types";
import type { VideoSheetData } from "@/components/VideoSheet";
import { formatStroke } from "@/lib/utils";
import { ViewButton } from "@/components/ViewButton";

/* ─── Timeline Section Wrapper ─── */
function TimelineSection({ color, icon, label, children, isLast = false }: {
  color: "orange" | "green" | "red"; icon: string; label: string; children: React.ReactNode; isLast?: boolean;
}) {
  const lineColor = color === "orange" ? "#ff7441" : color === "green" ? "#23a62a" : "#eb3030";
  const labelColor = color === "orange" ? "var(--brand-orange, #fa642d)" : color === "green" ? "#23a62a" : "#eb3030";
  return (
    <div className="flex flex-col items-start w-full" data-section-id={label}>
      <div className="flex gap-3 items-start w-full">
        <div className="flex flex-col items-center justify-between self-stretch shrink-0">
          <Image src={icon} alt="" width={24} height={24} />
          <div className="flex-1 w-px min-h-0" style={{ backgroundColor: lineColor }} />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex gap-3 items-center w-full">
            <span className="text-sm font-normal whitespace-nowrap" style={{ color: labelColor }}>{label}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: labelColor }} />
          </div>
          {children}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center h-8 overflow-hidden px-[11.5px]">
          <div className="w-px h-full" style={{ backgroundColor: lineColor }} />
        </div>
      )}
    </div>
  );
}

/* ─── Play Icon SVG ─── */
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M5.33 3.33L12 8L5.33 12.67V3.33Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─── Streak Run Block ─── */
interface StreakRun {
  score: string;
  type: "player" | "opponent";
  length: number;
  start_rally: number;
  start_ts?: number | null;
  end_ts?: number | null;
}

function StreakBar({ runs, totalRallies, onClickRun }: {
  runs: StreakRun[]; totalRallies: number; onClickRun?: (run: StreakRun) => void;
}) {
  const sorted = [...runs].sort((a, b) => a.start_rally - b.start_rally);
  const segments: { type: "gap" | "player" | "opponent"; flexBasis: number; run?: StreakRun }[] = [];
  let cursor = 0;
  for (const run of sorted) {
    const gap = run.start_rally - cursor;
    if (gap > 0) segments.push({ type: "gap", flexBasis: gap });
    segments.push({ type: run.type, flexBasis: Math.max(run.length, 3), run });
    cursor = run.start_rally + run.length;
  }
  const trailing = totalRallies - cursor;
  if (trailing > 0) segments.push({ type: "gap", flexBasis: trailing });

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* You badge */}
      <div className="flex items-center justify-center px-2 py-0.5 rounded bg-[#dfefff] self-start">
        <span className="text-xs font-normal text-[#2990fd] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>You</span>
      </div>

      {/* Timeline bar */}
      <div className="relative w-full">
        {/* Player labels (above bar) */}
        <div className="flex w-full mb-1" style={{ minHeight: 18 }}>
          {segments.map((seg, i) => {
            if (seg.type === "gap") return <div key={i} style={{ flex: seg.flexBasis }} />;
            const isPlayer = seg.type === "player";
            return (
              <div key={i} className="flex items-center justify-center" style={{ flex: seg.flexBasis }}>
                {isPlayer && <span className="text-xs font-medium text-[#3e95f3] text-center whitespace-nowrap" style={{ fontFamily: "var(--font-dm-sans)" }}>{seg.run!.score} pts</span>}
              </div>
            );
          })}
        </div>

        {/* Bar */}
        <div className="flex w-full rounded-[6px] overflow-hidden bg-[#e8e8e8]" style={{ height: 48 }}>
          {segments.map((seg, i) => {
            if (seg.type === "gap") return <div key={i} className="bg-[#e8e8e8]" style={{ flex: seg.flexBasis }} />;
            const isPlayer = seg.type === "player";
            return (
              <button key={i} type="button" onClick={() => onClickRun?.(seg.run!)}
                className={`${isPlayer ? "bg-[#3e95f3]" : "bg-[#f5364d]"} flex items-center justify-center cursor-pointer active:opacity-80`}
                style={{ flex: seg.flexBasis, border: "none", borderRadius: 6, height: 48 }}>
                <PlayIcon />
              </button>
            );
          })}
        </div>

        {/* Opponent labels (below bar) */}
        <div className="flex w-full mt-1" style={{ minHeight: 18 }}>
          {segments.map((seg, i) => {
            if (seg.type === "gap") return <div key={i} style={{ flex: seg.flexBasis }} />;
            const isPlayer = seg.type === "player";
            return (
              <div key={i} className="flex items-center justify-center" style={{ flex: seg.flexBasis }}>
                {!isPlayer && <span className="text-xs font-medium text-[#f5364d] text-center whitespace-nowrap" style={{ fontFamily: "var(--font-dm-sans)" }}>{seg.run!.score} pts</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Opp badge */}
      <div className="flex items-center justify-center px-2 py-0.5 rounded bg-[#fcd4d9] self-start">
        <span className="text-xs font-normal text-[#a22618] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>Opp</span>
      </div>
    </div>
  );
}

/* ─── Trigger Shot Card ─── */
function TriggerShotCard({ badge, badgeBg, badgeBorder, badgeColor, shotName, normalEff, crucialEff, delta, description, buttonLabel, onClickView }: {
  badge: string; badgeBg: string; badgeBorder: string; badgeColor: string;
  shotName: string; normalEff: number; crucialEff: number; delta: number;
  description: string; buttonLabel: string; onClickView?: () => void;
}) {
  const isPositive = delta > 0;
  const arrowColor = isPositive ? "#2dbd1a" : "#ff4e64";
  const pressureColor = isPositive ? "#2dbd1a" : "#ff4e64";
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-center px-2 py-0.5 rounded w-fit border" style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}>
          <span className="text-xs font-medium" style={{ color: badgeColor }}>{badge}</span>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]">{shotName}</span>
            <div className="flex gap-2 items-center justify-end">
              <span className="text-xs font-semibold text-[#2dbd1a]">{normalEff.toFixed(0)}% Eff.</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33 8h9.34" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.67 4L12.67 8L8.67 12" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: pressureColor }}>{crucialEff.toFixed(0)}% Eff.</span>
            </div>
          </div>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full">
            {description.startsWith("[narrative") ? `Effectiveness ${isPositive ? "jumps" : "drops"} from ${normalEff.toFixed(0)}% to ${crucialEff.toFixed(0)}% under pressure.` : description}
          </p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onClickView} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

interface Props {
  report: MatchReport;
  narrative: Narrative;
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function DynamicsTab({ report, narrative, onOpenVideo }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/dynamics_h2h_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => { setData(d.dynamics); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const narr = narrative?.section_narratives?.pressure_dynamics ?? {};
  const open = (vd: VideoSheetData) => onOpenVideo?.(vd);

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>;
  }

  const streaks = data.streaks;
  const trigger = data.trigger_shots;
  const lt = data.leading_trailing;

  const headline = data.headline?.startsWith("[narrative")
    ? (narr.dynamics_headline || "Match Dynamics")
    : data.headline;

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        <p className="text-[20px] font-medium leading-[1.32] text-[var(--text-heading,#161616)] tracking-[-0.5px]">{headline}</p>

        <div className="flex flex-col items-start w-full">
          {/* 1. STREAKS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STREAKS">
            <div className="flex flex-col gap-3 w-full">
              {streaks.games.map((g: any) => {
                const narrativeByGame: any = {};
                (narr.turning_points ?? []).forEach((n: any) => {
                  const m = n.moment?.match(/Game\s+(\d+)/i);
                  if (m) narrativeByGame[parseInt(m[1])] = n;
                });
                const ntp = narrativeByGame[g.game];
                return (
                  <div key={g.game} className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[var(--stroke-st-elv2,#eee)] flex flex-col gap-4 p-2 rounded-lg shadow-[0px_4px_7.8px_0px_rgba(186,186,186,0.25)] w-full">
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-lg font-semibold text-[var(--text-heading,#161616)] tracking-[-1px] leading-[1.2]">Game {g.game}</span>
                      {ntp && <p className="text-sm font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.4] w-full">{ntp.insight}</p>}
                    </div>
                    <StreakBar
                      runs={g.runs}
                      totalRallies={g.total_rallies || 40}
                      onClickRun={(run) => {
                        const ts = [run.start_ts, run.end_ts].filter(Boolean) as number[];
                        open({ title: `Game ${g.game} — ${run.type === "player" ? "Your" : "Opponent"} Streak`, subtitle: `${run.score} pts`, description: ntp?.insight ?? `${run.length}-point run.`, timestamps: ts, sectionLabel: "STREAKS", gameRuns: g.runs, gameTotalRallies: g.total_rallies || 40 });
                      }}
                    />
                  </div>
                );
              })}
              {streaks.games.length === 0 && <p className="text-xs text-[var(--text-subtext,#6d6d6d)]">No significant streaks identified.</p>}
            </div>
          </TimelineSection>

          {/* 2. LEADING VS TRAILING */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="LEADING V/S TRAILING" isLast>
            <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">
              {lt.narrative?.startsWith("[narrative")
                ? (narr.score_state?.leading_vs_trailing ?? `Effectiveness when leading: ${lt.leading?.avg_eff?.toFixed(0) ?? "—"}%, trailing: ${lt.trailing?.avg_eff?.toFixed(0) ?? "—"}%, equal: ${lt.equal?.avg_eff?.toFixed(0) ?? "—"}%.`)
                : lt.narrative}
            </p>
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
