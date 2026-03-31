"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ViewButton } from "@/components/ViewButton";
import { NarrativeText, Headline } from "@/components/Narrative";
import type { VideoSheetData } from "@/components/VideoSheet";

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
            <span className="text-sm font-normal whitespace-nowrap" style={{ color: labelColor, fontFamily: "var(--font-dm-sans)" }}>{label}</span>
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

/* ─── Warning Circle SVG ─── */
function WarningCircleSvg({ color = "#d33030" }: { color?: string }) {
  return (
    <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.5 0C38.031 0 49 10.969 49 24.5C49 38.031 38.031 49 24.5 49C10.969 49 0 38.031 0 24.5C0 10.969 10.969 0 24.5 0ZM24.5 3.267C12.773 3.267 3.267 12.773 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.773 36.227 3.267 24.5 3.267Z" fill="white"/>
      <path d="M24.5 0C30.403 0 36.108 2.131 40.565 6.002C45.021 9.872 47.931 15.222 48.758 21.066C49.585 26.911 48.275 32.858 45.068 37.814C41.86 42.769 36.971 46.399 31.3 48.037C25.629 49.675 19.557 49.212 14.201 46.731C8.845 44.249 4.564 39.917 2.148 34.531C-0.269 29.146 -0.66 23.069 1.046 17.418C2.752 11.767 6.441 6.922 11.435 3.774L13.176 6.536C7.222 10.298 3.267 16.937 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.956 36.522 3.564 25.048 3.273L24.5 3.267V0Z" fill={color}/>
    </svg>
  );
}

/* ─── Rally Length Card ─── */
function RallyCard({ label, winRate, winRateLabel, rallyCount, rallyPct, description }: {
  label: string; winRate: number; winRateLabel: string; rallyCount: number; rallyPct: number; description: string;
}) {
  const wrColor = winRate >= 0.55 ? "#2dbd1a" : winRate >= 0.45 ? "#f59e0b" : "#ff4e64";
  const barColor = winRate >= 0.55 ? "#2dbd1a" : winRate >= 0.45 ? "#f59e0b" : "#ff4e64";
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] flex flex-col gap-2 px-3 py-2 rounded-lg overflow-hidden w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-[#383838]" style={{ fontFamily: "var(--font-dm-sans)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: wrColor, fontFamily: "var(--font-dm-sans)" }}>{winRateLabel}</span>
      </div>
      <div className="flex items-center justify-between w-full h-5">
        <div className="bg-[#e3e3e3] h-1 rounded-full overflow-hidden flex-1 mr-3">
          <div className="h-1 rounded-[15px]" style={{ width: `${Math.round(winRate * 100)}%`, background: barColor }} />
        </div>
        <span className="text-xs font-normal text-[#868686] text-center shrink-0" style={{ fontFamily: "var(--font-dm-sans)" }}>{rallyCount}x</span>
      </div>
      <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
    </div>
  );
}

/* ─── Match Phases Chart (single line) ─── */
function MatchPhasesChart({ points }: { points: { label: string; avg_eff: number; color: string }[] }) {
  if (points.length === 0) return null;
  const yTicks = [80, 70, 60, 50, 40, 30];
  const yMin = 25; const yMax = 85;
  const chartW = 300; const chartH = 260;
  const padT = 12; const padB = 12; const padL = 10; const padR = 10;
  const plotW = chartW - padL - padR; const plotH = chartH - padT - padB;
  function toX(i: number) { return padL + (i / Math.max(points.length - 1, 1)) * plotW; }
  function toY(val: number) { return padT + ((yMax - val) / (yMax - yMin)) * plotH; }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="bg-[#f5f5f5] rounded-xl p-4 w-full">
        <div className="flex w-full">
          <div className="relative shrink-0 pr-1" style={{ height: chartH, width: 55 }}>
            {yTicks.map((val) => (
              <span key={val} className="absolute text-xs font-normal text-[#cfcfcf] leading-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-dm-sans)", top: toY(val) - 6, left: 0 }}>{val}% eff.</span>
            ))}
          </div>
          <div className="flex-1">
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
              {yTicks.map((val) => (
                <line key={val} x1={padL} y1={toY(val)} x2={chartW - padR} y2={toY(val)} stroke="#e8e8e8" strokeWidth={1} />
              ))}
              {points.map((pt, i) => {
                if (i === 0) return null;
                const prev = points[i - 1];
                return <line key={i} x1={toX(i - 1)} y1={toY(prev.avg_eff)} x2={toX(i)} y2={toY(pt.avg_eff)} stroke={pt.color} strokeWidth={2.5} strokeLinecap="round" />;
              })}
              {points.map((pt, i) => <circle key={i} cx={toX(i)} cy={toY(pt.avg_eff)} r={5} fill={pt.color} />)}
              {points.map((pt, i) => {
                const x = toX(i); const y = toY(pt.avg_eff);
                return <text key={i} x={i === 0 ? x + 12 : x - 5} y={i % 2 === 0 ? y - 14 : y + 20}
                  fill={pt.color} fontSize={14} fontWeight={500} fontFamily="var(--font-dm-sans)">{pt.avg_eff}%</text>;
              })}
            </svg>
          </div>
        </div>
      </div>
      <div className="flex w-full rounded-lg overflow-hidden">
        {points.map((pt) => (
          <div key={pt.label} className="flex-1 py-2 text-center text-xs font-medium text-white"
            style={{ backgroundColor: pt.color, fontFamily: "var(--font-dm-sans)" }}>{pt.label}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tempo Shot Tile ─── */
function ShotTile({ name, effLabel, count, buttonLabel, onView }: {
  name: string; effLabel: string; count: string; buttonLabel: string; onView?: () => void;
}) {
  const effColor = effLabel ? "#ff4e64" : "#868686";
  return (
    <div className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[#eee] flex flex-col gap-2 p-2 rounded-lg flex-1 min-w-[140px]">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-[var(--text-heading,#161616)]" style={{ fontFamily: "var(--font-dm-sans)" }}>{name}</span>
        <div className="flex gap-2 items-center">
          {effLabel && <span className="text-xs font-normal" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{effLabel}</span>}
          <div className="w-1 h-1 rounded-full bg-[#868686]" />
          <span className="text-xs font-normal text-[#868686]" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Predictable Pattern Card (matches Figma) ─── */
function PredictablePatternCard({ effLabel, effColor, oppAction, yourAction, count, buttonLabel, onView }: {
  effLabel: string; effColor: string; oppAction: string; yourAction: string; count: string; buttonLabel: string; onView?: () => void;
}) {
  // Parse count like "8/12" or "17/26" for progress bar
  const countParts = count.match(/(\d+)\s*\/\s*(\d+)/);
  const numerator = countParts ? parseInt(countParts[1]) : 0;
  const denominator = countParts ? parseInt(countParts[2]) : 1;
  const progressPct = denominator > 0 ? (numerator / denominator) * 100 : 0;

  return (
    <div style={{
      background: "var(--bg-elv-1, #fafafa)",
      border: "1px solid var(--stroke-st-elv1, #f5f5f5)",
      borderRadius: 12,
      padding: "16px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Effectiveness label */}
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: effColor, lineHeight: 1.2 }}>
        {effLabel}
      </span>

      {/* Opp action → */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          background: "#fcd4d9", color: "#a22618", fontSize: 12, fontWeight: 400,
          padding: "2px 10px", borderRadius: 4, lineHeight: 1.6,
        }}>Opp</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#383838" }}>{oppAction}</span>
        <span style={{ fontSize: 14, color: "#383838" }}>→</span>
      </div>

      {/* You action */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          background: "#dee5ff", color: "#6141ef", fontSize: 12, fontWeight: 400,
          padding: "2px 10px", borderRadius: 4, lineHeight: 1.6,
        }}>You</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#383838" }}>{yourAction}</span>
      </div>

      {/* Progress bar + count */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: "#e0e0e0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: "#e53e3e", borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 400, color: "#868686", whiteSpace: "nowrap" }}>{count}</span>
      </div>

      {/* View button */}
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Pattern Sequence Card ─── */
function PatternSequenceCard({ title, count, description, steps, buttonLabel, onView }: {
  title: string; count: string; description: string; steps: { who: string; action: string }[]; buttonLabel: string; onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</span>
          <span className="text-xs font-normal text-[#868686]" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
        </div>
        <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
        {steps.map((step, i) => {
          const isYou = step.who === "You";
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-xs font-medium text-[#383838]">→</span>}
              <div className="flex items-center justify-center px-2 rounded" style={{ backgroundColor: isYou ? "#dee5ff" : "#fcd4d9" }}>
                <span className="text-xs font-normal leading-[1.6]" style={{ color: isYou ? "#6141ef" : "#a22618", fontFamily: "var(--font-dm-sans)" }}>{step.who}</span>
              </div>
              <span className="text-xs font-medium text-[#383838]" style={{ fontFamily: "var(--font-dm-sans)" }}>{step.action}</span>
            </div>
          );
        })}
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Opponent Pressure Card ─── */
function OpponentPressureCard({
  badge, badgeBg, badgeBorder, badgeColor,
  title, description, buttonLabel, onClickView,
}: {
  badge: string; badgeBg: string; badgeBorder: string; badgeColor: string;
  title: string; description: string; buttonLabel: string; onClickView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-center px-2 py-0.5 rounded w-fit border"
          style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}>
          <span className="text-xs font-medium" style={{ color: badgeColor }}>{badge}</span>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]">{title}</span>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full">{description}</p>
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
  analysisView?: "your" | "opponent";
  onOpenVideo?: (data: VideoSheetData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  narrative?: any;
}

export function PatternsTab({ analysisView = "your", onOpenVideo, narrative }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/patterns_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => { setData(d.patterns); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeData = useMemo(() => {
    if (!data) return null;
    return analysisView === "opponent" ? data.opponent_analysis : data.your_analysis;
  }, [data, analysisView]);

  const open = (vd: VideoSheetData) => onOpenVideo?.(vd);

  if (loading || !activeData) {
    return <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>;
  }

  const rl = activeData.rally_length;
  const mp = activeData.match_phases;
  const tc = activeData.tempo_control;
  const pred = activeData.predictability;
  const winPat = activeData.winning_patterns || [];
  const losePat = activeData.losing_patterns || [];
  const hasPatterns = winPat.length > 0 || losePat.length > 0;
  const oppPressure = narrative?.section_narratives?.pressure_dynamics?.opponent_pressure;

  const headline = activeData.headline?.startsWith("[narrative")
    ? (analysisView === "opponent"
      ? "Opponent patterns — rally length, tempo, predictability, and tactical sequences."
      : "Your patterns — rally length, tempo, predictability, and tactical sequences.")
    : activeData.headline;

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        {/* Headline */}
        <Headline>
          {headline}
        </Headline>

        <div className="flex flex-col items-start w-full">
          {/* 1. RALLY LENGTH */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="RALLY LENGTH">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-3 w-full">
                {rl.cards.map((c: any, i: number) => (
                  <RallyCard key={i} label={c.label} winRate={c.win_rate} winRateLabel={c.win_rate_label}
                    rallyCount={c.rally_count} rallyPct={c.rally_pct}
                    description={c.description?.startsWith("[narrative") ? `${c.label}: ${c.rally_count} rallies at ${c.win_rate_label}.` : c.description} />
                ))}
              </div>
              <NarrativeText>
                {rl.insight_text?.startsWith("[narrative") ? "Rally length insight will be available with narrative analysis." : rl.insight_text}
              </NarrativeText>
            </div>
          </TimelineSection>

          {/* 2. MATCH PHASES */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="MATCH PHASES">
            <div className="flex flex-col gap-3 w-full">
              <MatchPhasesChart points={mp.chart_points} />
              <NarrativeText>
                {mp.insight_text?.startsWith("[narrative") ? "Match phase insight will be available with narrative analysis." : mp.insight_text}
              </NarrativeText>
            </div>
          </TimelineSection>

          {/* 3. TEMPO CONTROL */}
          {tc.groups.length > 0 && (
            <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="TEMPO CONTROL">
              <div className="flex flex-col gap-3 w-full">
                {tc.groups.map((g: any, gi: number) => (
                  <div key={gi}>
                    {gi > 0 && <div className="h-px w-full bg-[var(--grey-900,#efece6)] mb-3" />}
                    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
                      <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{g.title}</span>
                      <div className="flex flex-wrap gap-3 w-full">
                        {g.shots.map((s: any, si: number) => (
                          <ShotTile key={si} name={s.name} effLabel={s.eff_label || ""} count={s.count} buttonLabel={s.button_label}
                            onView={() => open({ title: s.name, count: s.count, timestamps: s.timestamps_seconds || [], sectionLabel: "TEMPO CONTROL", badge: g.title, badgeBg: g.title.toLowerCase().includes("fast") ? "rgba(255,78,100,0.12)" : "rgba(245,158,11,0.12)", badgeBorder: g.title.toLowerCase().includes("fast") ? "#ff4e64" : "#f59e0b", badgeColor: g.title.toLowerCase().includes("fast") ? "#ff4e64" : "#f59e0b" })} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <NarrativeText>
                  {tc.insight_text?.startsWith("[narrative") ? `Tempo: ${tc.who_controls} controls the pace.` : tc.insight_text}
                </NarrativeText>
              </div>
            </TimelineSection>
          )}

          {/* 4. PREDICTABLE PATTERNS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="PREDICTABLE PATTERNS"
            isLast={!hasPatterns}>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex gap-2.5 items-center p-2 rounded-lg w-full" style={{
                backgroundColor: pred.variant === "danger" ? "rgba(211,48,48,0.1)" : "rgba(231,157,28,0.1)"
              }}>
                <div className="relative flex items-center justify-center w-[49px] h-[49px] shrink-0">
                  <div className="absolute inset-0">
                    <WarningCircleSvg color={pred.variant === "danger" ? "#d33030" : "#e79d1c"} />
                  </div>
                  <span className="relative text-xs font-semibold text-center"
                    style={{ color: pred.variant === "danger" ? "#d33030" : "#e79d1c", fontFamily: "var(--font-dm-sans)" }}>{pred.percentage}</span>
                </div>
                <p className="text-sm font-normal leading-[1.4]"
                  style={{ color: pred.variant === "danger" ? "#9f0c0c" : "#e79d1c", fontFamily: "var(--font-dm-sans)" }}>{pred.message}</p>
              </div>

              <div className="flex gap-3 w-full overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" as any, WebkitOverflowScrolling: "touch" }}>
                {pred.cards.map((c: any, i: number) => {
                  const eff = c.effectiveness || 0;
                  const effColor = eff >= 65 ? "#2dc535" : eff >= 45 ? "#f59e0b" : "#ff4e64";
                  const thisPatternSteps = [
                    { who: "Opp" as const, action: c.opp_action },
                    { who: "You" as const, action: c.your_action, effLabel: c.eff_label, effColor },
                  ];
                  return (
                    <div key={i} style={{ flex: "0 0 75%", minWidth: 0 }}>
                      <PredictablePatternCard effLabel={c.eff_label} effColor={effColor}
                        oppAction={c.opp_action} yourAction={c.your_action} count={c.count_label} buttonLabel={c.button_label}
                        onView={() => open({ title: `${c.opp_action} → ${c.your_action}`, subtitle: c.eff_label,
                          description: pred.insight_text?.startsWith("[narrative") ? "Predictability patterns" : pred.insight_text,
                          timestamps: c.timestamps_seconds || [], sectionLabel: "PREDICTABLE PATTERNS",
                          count: c.count_label, steps: thisPatternSteps })} />
                    </div>
                  );
                })}
              </div>

              <NarrativeText>
                {pred.insight_text?.startsWith("[narrative") ? "Predictability insight will be available with narrative analysis." : pred.insight_text}
              </NarrativeText>
            </div>
          </TimelineSection>

          {/* 5. WINNING PATTERNS */}
          {winPat.length > 0 ? (
            <TimelineSection color="green" icon="/icons/timeline-green.svg" label="WINNING PATTERNS" isLast={losePat.length === 0}>
              <NarrativeText>
                {activeData.winning_patterns_insight?.startsWith("[narrative") || !activeData.winning_patterns_insight
                  ? "Winning sequence pattern."
                  : activeData.winning_patterns_insight}
              </NarrativeText>
              {winPat.map((seq: any, i: number) => (
                <PatternSequenceCard key={i}
                  title={seq.title?.startsWith("[narrative") ? `Winning sequence (${seq.count})` : seq.title}
                  count={seq.count}
                  description={seq.description?.startsWith("[narrative") ? "Winning pattern sequence." : seq.description}
                  steps={seq.steps} buttonLabel={seq.button_label}
                  onView={() => open({ title: seq.title?.startsWith("[narrative") ? `Winning sequence` : seq.title, subtitle: seq.count, description: seq.description?.startsWith("[narrative") ? "Winning pattern sequence." : seq.description, timestamps: seq.timestamps_seconds || [], sectionLabel: "WINNING PATTERNS", count: seq.count, steps: seq.steps })} />
              ))}
            </TimelineSection>
          ) : !hasPatterns ? (
            <TimelineSection color="green" icon="/icons/timeline-green.svg" label="PATTERNS" isLast>
              <p className="text-sm text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                No significant winning or losing patterns found for this match.
              </p>
            </TimelineSection>
          ) : null}

          {/* 6. LOSING PATTERNS */}
          {losePat.length > 0 && (
            <TimelineSection color="red" icon="/icons/timeline-red.svg" label="LOSING PATTERNS"
              isLast={analysisView !== "opponent" || !oppPressure}>
              <NarrativeText>
                {activeData.losing_patterns_insight?.startsWith("[narrative") || !activeData.losing_patterns_insight
                  ? "Losing sequence pattern."
                  : activeData.losing_patterns_insight}
              </NarrativeText>
              {losePat.map((seq: any, i: number) => (
                <PatternSequenceCard key={i}
                  title={seq.title?.startsWith("[narrative") ? `Losing sequence (${seq.count})` : seq.title}
                  count={seq.count}
                  description={seq.description?.startsWith("[narrative") ? "Losing pattern sequence." : seq.description}
                  steps={seq.steps} buttonLabel={seq.button_label}
                  onView={() => open({ title: seq.title?.startsWith("[narrative") ? `Losing sequence` : seq.title, subtitle: seq.count, description: seq.description?.startsWith("[narrative") ? "Losing pattern sequence." : seq.description, timestamps: seq.timestamps_seconds || [], sectionLabel: "LOSING PATTERNS", count: seq.count, steps: seq.steps })} />
              ))}
            </TimelineSection>
          )}

        </div>
      </div>
    </div>
  );
}
