"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { MatchReport, Narrative } from "@/lib/types";
import type { VideoSheetData } from "@/components/VideoSheet";
import { ViewButton } from "@/components/ViewButton";
import { NarrativeText, Headline } from "@/components/Narrative";

/* ─── Timeline Section Wrapper ─── */
function TimelineSection({ color, icon, label, children, isLast = false }: {
  color: "orange" | "green" | "red"; icon: string; label: string; children: React.ReactNode; isLast?: boolean;
}) {
  const lineColor = color === "orange" ? "#ff7441" : color === "green" ? "#23a62a" : "#eb3030";
  const labelColor = color === "orange" ? "var(--brand-orange, #fa642d)" : color === "green" ? "#23a62a" : "#eb3030";
  return (
    <div className="flex flex-col items-start w-full">
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
      <div className="flex items-center justify-center px-2 py-0.5 rounded bg-[#dfefff] self-start">
        <span className="text-xs font-normal text-[#2990fd] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>You</span>
      </div>
      <div className="relative w-full">
        <div className="flex w-full mb-1" style={{ minHeight: 18 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ flex: seg.flexBasis, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {seg.type === "player" && seg.run && <span className="text-xs font-medium text-[#3e95f3] text-center whitespace-nowrap" style={{ fontFamily: "var(--font-dm-sans)" }}>{seg.run.score} pts</span>}
            </div>
          ))}
        </div>
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
        <div className="flex w-full mt-1" style={{ minHeight: 18 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ flex: seg.flexBasis, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {seg.type === "opponent" && seg.run && <span className="text-xs font-medium text-[#f5364d] text-center whitespace-nowrap" style={{ fontFamily: "var(--font-dm-sans)" }}>{seg.run.score} pts</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center px-2 py-0.5 rounded bg-[#fcd4d9] self-start">
        <span className="text-xs font-normal text-[#a22618] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>Opp</span>
      </div>
    </div>
  );
}

/* ─── Category Comparison Bar ─── */
function ComparisonBar({ category, playerEff, opponentEff }: { category: string; playerEff: number; opponentEff: number }) {
  const total = playerEff + opponentEff;
  const playerPct = total > 0 ? (playerEff / total) * 100 : 50;
  return (
    <div className="flex flex-col gap-1 items-center w-full">
      <span className="text-xs font-normal text-[#5c5850] leading-[1.6] text-center w-full">{category}</span>
      <div className="flex gap-[7px] items-center w-full">
        <span className="text-xs font-semibold text-[#2990fd] text-center w-6">{playerEff.toFixed(0)}</span>
        <div className="flex-1 flex gap-1 items-center">
          <div className="h-3 rounded bg-[#2990fd]" style={{ width: `${playerPct}%` }} />
          <div className="h-3 rounded bg-[#f02a2d] flex-1" />
        </div>
        <span className="text-xs font-semibold text-[#f02a2d] text-center w-6">{opponentEff.toFixed(0)}</span>
      </div>
    </div>
  );
}

/* ─── Style illustration map ─── */
const STYLE_ILLUSTRATIONS: Record<string, string> = {
  attacking: "/h2h_style_character-illustrations/Attacking.png",
  balanced: "/h2h_style_character-illustrations/Balanced.png",
  defensive: "/h2h_style_character-illustrations/Defensive.png",
  "net player": "/h2h_style_character-illustrations/Net Player.png",
  net: "/h2h_style_character-illustrations/Net Player.png",
};

function StyleCard({ label, styleName, styleKey, description }: {
  label: string; styleName: string; styleKey: string; description: string;
}) {
  const illustration = STYLE_ILLUSTRATIONS[styleKey.toLowerCase().trim()] ?? null;
  return (
    <div className="flex flex-col gap-1 pt-6 pb-3 px-3 rounded-lg w-full relative"
      style={{ background: "var(--bg-elv-1, #fafafa)", border: "1px solid rgba(255,158,123,0.4)", overflow: "visible" }}>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-[#8a8a8a] leading-[1.6]">{label}</span>
        <span className="text-sm font-medium leading-[1.4] bg-clip-text"
          style={{ backgroundImage: "linear-gradient(104deg, #fa591f 1%, #edb91c 50%, #f5612b 99%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
          {styleName}
        </span>
      </div>
      <NarrativeText>{description}</NarrativeText>
      {illustration && (
        <div className="absolute" style={{ right: 4, top: -20, width: 64, height: 67 }}>
          <Image src={illustration} alt={styleKey} width={64} height={67} style={{ objectFit: "contain", width: 64, height: 67 }} />
        </div>
      )}
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

export function HeadToHeadTab({ report, narrative, onOpenVideo }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/dynamics_h2h_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const h2hNarr = narrative?.section_narratives?.head_to_head ?? {};
  const dynNarr = narrative?.section_narratives?.pressure_dynamics ?? {};
  const open = (vd: VideoSheetData) => onOpenVideo?.(vd);

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>;
  }

  const h2h = data.head_to_head;
  const dyn = data.dynamics;
  const stats = h2h.stats;
  const we = h2h.winners_errors;
  const style = h2h.style;
  const streaks = dyn?.streaks;
  const lt = dyn?.leading_trailing;

  const headline = h2h.headline?.startsWith("[narrative")
    ? (h2hNarr.h2h_headline || "Head to Head")
    : h2h.headline;

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        <Headline>{headline}</Headline>

        <div className="flex flex-col items-start w-full">
          {/* 1. STREAKS (from Dynamics) */}
          {streaks && streaks.games.length > 0 && (
            <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STREAKS">
              <div className="flex flex-col gap-3 w-full">
                {streaks.games.map((g: any) => {
                  const narrativeByGame: any = {};
                  (dynNarr.turning_points ?? []).forEach((n: any) => {
                    const m = n.moment?.match(/Game\s+(\d+)/i);
                    if (m) narrativeByGame[parseInt(m[1])] = n;
                  });
                  const ntp = narrativeByGame[g.game];
                  return (
                    <div key={g.game} className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[var(--stroke-st-elv2,#eee)] flex flex-col gap-4 p-2 rounded-lg shadow-[0px_4px_7.8px_0px_rgba(186,186,186,0.25)] w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-lg font-semibold text-[var(--text-heading,#161616)] tracking-[-1px] leading-[1.2]">Game {g.game}</span>
                        {ntp && <NarrativeText>{ntp.insight}</NarrativeText>}
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
              </div>
            </TimelineSection>
          )}

          {/* 2. LEADING VS TRAILING (from Dynamics) */}
          {lt && (
            <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="LEADING V/S TRAILING">
              <div className="flex flex-col gap-4 w-full">
                <NarrativeText>
                  {lt.narrative?.startsWith("[narrative")
                    ? (dynNarr.score_state?.leading_vs_trailing ?? `You are significantly more effective when trailing (${lt.trailing?.avg_eff?.toFixed(0) ?? "—"}%) than when leading (${lt.leading?.avg_eff?.toFixed(0) ?? "—"}%). This suggests you play with more focus when chasing the score but may relax or become predictable when you have a lead.`)
                    : lt.narrative}
                </NarrativeText>

                {/* Card container */}
                <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[#f5f5f5] rounded-lg p-3 flex flex-col gap-3 w-full">
                  {/* You banner */}
                  <div className="flex items-center justify-center px-2 py-1 rounded bg-[#dfefff] w-full">
                    <span className="text-sm font-medium text-[#2990fd] leading-[1.4]" style={{ fontFamily: "var(--font-dm-sans)" }}>You</span>
                  </div>

                  {/* Player stats row */}
                  <div className="flex gap-2 w-full">
                    {(() => {
                      const pLead = lt.leading?.avg_eff;
                      const pNeutral = lt.equal?.avg_eff;
                      const pTrail = lt.trailing?.avg_eff;
                      const avg = pNeutral ?? ((pLead ?? 0) + (pTrail ?? 0)) / 2;
                      return [
                        { label: "LEADING", value: pLead, arrow: pLead != null && avg > 0 ? (pLead < avg ? "↓" : pLead > avg ? "↑" : null) : null, arrowColor: pLead != null && pLead < avg ? "#ff4e64" : "#2dbd1a" },
                        { label: "NEUTRAL", value: pNeutral, arrow: null, arrowColor: "" },
                        { label: "TRAILING", value: pTrail, arrow: pTrail != null && avg > 0 ? (pTrail > avg ? "↑" : pTrail < avg ? "↓" : null) : null, arrowColor: pTrail != null && pTrail > avg ? "#2dbd1a" : "#ff4e64" },
                      ].map((item) => (
                        <div key={item.label} className="flex-1 bg-[#eef2f7] border border-[#e4e8ed] rounded-lg p-2 flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-medium text-[var(--text-subtext,#6d6d6d)] uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-sans)" }}>{item.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{item.value?.toFixed(0) ?? "—"}%</span>
                            {item.arrow && <span className="text-sm font-semibold" style={{ color: item.arrowColor }}>{item.arrow}</span>}
                          </div>
                          <span className="text-[10px] font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Effectiveness</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* V/S divider */}
                  <div className="flex gap-2 items-center w-full">
                    <div className="flex-1 h-px bg-[#dfdfdf]" />
                    <span className="text-sm font-medium text-[#969696] leading-[1.4]" style={{ fontFamily: "var(--font-dm-sans)" }}>V/S</span>
                    <div className="flex-1 h-px bg-[#dfdfdf]" />
                  </div>

                  {/* Opp banner */}
                  <div className="flex items-center justify-center px-2 py-1 rounded bg-[#fcd4d9] w-full">
                    <span className="text-sm font-medium text-[#a22618] leading-[1.4]" style={{ fontFamily: "var(--font-dm-sans)" }}>Opp</span>
                  </div>

                  {/* Opponent stats row */}
                  <div className="flex gap-2 w-full">
                    {(() => {
                      const oLead = lt.opponent_leading?.avg_eff ?? lt.leading?.opp_eff;
                      const oNeutral = lt.opponent_equal?.avg_eff ?? lt.equal?.opp_eff;
                      const oTrail = lt.opponent_trailing?.avg_eff ?? lt.trailing?.opp_eff;
                      const avg = oNeutral ?? ((oLead ?? 0) + (oTrail ?? 0)) / 2;
                      return [
                        { label: "LEADING", value: oLead, arrow: oLead != null && avg > 0 ? (oLead > avg ? "↑" : oLead < avg ? "↓" : null) : null, arrowColor: oLead != null && oLead > avg ? "#2dbd1a" : "#ff4e64" },
                        { label: "NEUTRAL", value: oNeutral, arrow: null, arrowColor: "" },
                        { label: "TRAILING", value: oTrail, arrow: oTrail != null && avg > 0 ? (oTrail < avg ? "↓" : oTrail > avg ? "↑" : null) : null, arrowColor: oTrail != null && oTrail < avg ? "#ff4e64" : "#2dbd1a" },
                      ].map((item) => (
                        <div key={item.label} className="flex-1 bg-[#f9f9f9] border border-[#f0f0f0] rounded-lg p-2 flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-medium text-[var(--text-subtext,#6d6d6d)] uppercase tracking-wider" style={{ fontFamily: "var(--font-dm-sans)" }}>{item.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold text-[#868686] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{item.value?.toFixed(0) ?? "—"}%</span>
                            {item.arrow && <span className="text-sm font-semibold" style={{ color: item.arrowColor }}>{item.arrow}</span>}
                          </div>
                          <span className="text-[10px] font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Effectiveness</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </TimelineSection>
          )}

          {/* 3. STATS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STATS">
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-[18px] p-3 rounded-lg w-full">
                <div className="flex gap-2 items-center w-full">
                  <div className="flex items-center justify-center px-2 rounded bg-[#dfefff]">
                    <span className="text-sm font-medium text-[#2990fd] leading-[1.4]">You</span>
                  </div>
                  <div className="flex-1 h-px bg-[#dfdfdf]" />
                  <div className="flex items-center justify-center px-2 rounded bg-[#fcd4d9]">
                    <span className="text-sm font-medium text-[#a22618] leading-[1.4]">Opp</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {stats.categories.map((c: any, i: number) => (
                    <ComparisonBar key={i} category={c.display_name} playerEff={c.player_eff} opponentEff={c.opponent_eff} />
                  ))}
                </div>
              </div>
              {h2hNarr.category_comparison_insight && (
                <NarrativeText>{h2hNarr.category_comparison_insight}</NarrativeText>
              )}
            </div>
          </TimelineSection>

          {/* 4. WINNERS AND ERRORS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="WINNERS AND ERRORS">
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-3 rounded-lg w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-center px-2 rounded bg-[#dfefff] w-full">
                    <span className="text-sm font-medium text-[#2990fd] leading-[1.4]">You</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 bg-[#dfffe0] rounded flex flex-col gap-2.5 items-start justify-center px-2 py-2">
                      <span className="text-2xl font-semibold text-[#1ea223] tracking-[-1px] leading-[1.2]">{we.player_winners}</span>
                      <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)] leading-[1.6]">WINNERS</span>
                    </div>
                    <div className="flex-1 bg-[#fcd4d9] rounded flex flex-col gap-2.5 items-start justify-center px-2 py-2">
                      <span className="text-2xl font-semibold text-[#ff4e64] tracking-[-1px] leading-[1.2]">{we.player_ue}</span>
                      <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)] leading-[1.6]">UNFORCED ERRORS</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex-1 h-px bg-[#dfdfdf]" />
                  <span className="text-sm font-medium text-[#969696] leading-[1.4]">V/S</span>
                  <div className="flex-1 h-px bg-[#dfdfdf]" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-center px-2 rounded bg-[#fcd4d9] w-full">
                    <span className="text-sm font-medium text-[#a22618] leading-[1.4]">Opp</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 bg-[#ededed] rounded flex flex-col gap-2.5 items-start justify-center px-2 py-2">
                      <span className="text-2xl font-semibold text-[#373737] tracking-[-1px] leading-[1.2]">{we.opponent_winners}</span>
                      <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)] leading-[1.6]">WINNERS</span>
                    </div>
                    <div className="flex-1 bg-[#ededed] rounded flex flex-col gap-2.5 items-start justify-center px-2 py-2">
                      <span className="text-2xl font-semibold text-[#373737] tracking-[-1px] leading-[1.2]">{we.opponent_ue}</span>
                      <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)] leading-[1.6]">UNFORCED ERRORS</span>
                    </div>
                  </div>
                </div>
              </div>
              {h2hNarr.winner_error_insight && (
                <NarrativeText>{h2hNarr.winner_error_insight}</NarrativeText>
              )}
            </div>
          </TimelineSection>

          {/* 5. STYLE */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STYLE" isLast>
            <div className="flex flex-col gap-3 w-full" style={{ overflow: "visible" }}>
              <StyleCard label="You are a" styleName={`${style.player_style.toUpperCase()} PLAYER`} styleKey={style.player_style}
                description={style.player_description?.startsWith("[narrative") ? (h2hNarr.style_comparison_insight ?? "Your play style creates consistent pressure.") : style.player_description} />
              <div className="flex gap-2 items-center w-full">
                <div className="flex-1 h-px bg-[#dfdfdf]" />
                <span className="text-sm font-medium text-[#969696] leading-[1.4]">V/S</span>
                <div className="flex-1 h-px bg-[#dfdfdf]" />
              </div>
              <StyleCard label="Your opponent was a" styleName={`${style.opponent_style.toUpperCase()} PLAYER`} styleKey={style.opponent_style}
                description={style.opponent_description?.startsWith("[narrative") ? (h2hNarr.rally_length_comparison?.overall_insight ?? "Your opponent played a reactive game.") : style.opponent_description} />
            </div>
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
