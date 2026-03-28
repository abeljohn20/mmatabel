"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { MatchReport, Narrative } from "@/lib/types";

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
      <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-[80%]">{description}</p>
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
}

export function HeadToHeadTab({ report, narrative }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/dynamics_h2h_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => { setData(d.head_to_head); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const narr = narrative?.section_narratives?.head_to_head ?? {};

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Loading…</div>;
  }

  const stats = data.stats;
  const we = data.winners_errors;
  const style = data.style;

  const headline = data.headline?.startsWith("[narrative")
    ? (narr.h2h_headline || "Head to Head")
    : data.headline;

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        <p className="text-[20px] font-medium leading-[1.32] text-[var(--text-heading,#161616)] tracking-[-0.5px]">{headline}</p>

        <div className="flex flex-col items-start w-full">
          {/* 1. STATS */}
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
              {narr.category_comparison_insight && (
                <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">{narr.category_comparison_insight}</p>
              )}
            </div>
          </TimelineSection>

          {/* 2. WINNERS AND ERRORS */}
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
              {narr.winner_error_insight && (
                <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">{narr.winner_error_insight}</p>
              )}
            </div>
          </TimelineSection>

          {/* 3. STYLE */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STYLE" isLast>
            <div className="flex flex-col gap-3 w-full" style={{ overflow: "visible" }}>
              <StyleCard label="You are a" styleName={`${style.player_style.toUpperCase()} PLAYER`} styleKey={style.player_style}
                description={style.player_description?.startsWith("[narrative") ? (narr.style_comparison_insight ?? "Your play style creates consistent pressure.") : style.player_description} />
              <div className="flex gap-2 items-center w-full">
                <div className="flex-1 h-px bg-[#dfdfdf]" />
                <span className="text-sm font-medium text-[#969696] leading-[1.4]">V/S</span>
                <div className="flex-1 h-px bg-[#dfdfdf]" />
              </div>
              <StyleCard label="Your opponent was a" styleName={`${style.opponent_style.toUpperCase()} PLAYER`} styleKey={style.opponent_style}
                description={style.opponent_description?.startsWith("[narrative") ? (narr.rally_length_comparison?.overall_insight ?? "Your opponent played a reactive game.") : style.opponent_description} />
            </div>
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
