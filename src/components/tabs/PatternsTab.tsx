"use client";

import Image from "next/image";
import { ViewButton } from "@/components/ViewButton";

/* ─── Shared Timeline Components (same as OpeningPhaseTab) ─── */

function TimelineSection({
  color,
  icon,
  label,
  children,
  isLast = false,
}: {
  color: "orange" | "green" | "red";
  icon: string;
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  const lineColor =
    color === "orange" ? "#ff7441" : color === "green" ? "#23a62a" : "#eb3030";
  const labelColor =
    color === "orange"
      ? "var(--brand-orange, #fa642d)"
      : color === "green"
        ? "#23a62a"
        : "#eb3030";

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex gap-3 items-start w-full">
        <div className="flex flex-col items-center justify-between self-stretch shrink-0">
          <Image src={icon} alt="" width={24} height={24} />
          <div
            className="flex-1 w-px min-h-0"
            style={{ backgroundColor: lineColor }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex gap-3 items-center w-full">
            <span
              className="text-sm font-normal whitespace-nowrap"
              style={{ color: labelColor, fontFamily: "var(--font-dm-sans)" }}
            >
              {label}
            </span>
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

/* ─── ViewButton imported from @/components/ViewButton ─── */

/* ─── Rally Length Card ─── */
function RallyCard({
  label,
  winRate,
  winRateColor,
  barWidthPct,
  barColor,
  count,
  description,
}: {
  label: string;
  winRate: string;
  winRateColor: string;
  barWidthPct: string;
  barColor: string;
  count: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] flex flex-col gap-2 px-3 py-2 rounded-lg overflow-hidden w-full">
      <div className="flex items-center justify-between w-full">
        <span
          className="text-sm font-medium text-[#383838]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {label}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: winRateColor, fontFamily: "var(--font-dm-sans)" }}
        >
          {winRate}
        </span>
      </div>
      <div className="flex items-center justify-between w-full h-5">
        <div className="bg-[#e3e3e3] h-1 rounded-full overflow-hidden flex-1 mr-3">
          <div
            className="h-1 rounded-[15px]"
            style={{ width: barWidthPct, background: barColor }}
          />
        </div>
        <span
          className="text-xs font-normal text-[#868686] text-center shrink-0"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {count}
        </span>
      </div>
      <p
        className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {description}
      </p>
    </div>
  );
}

/* ─── Match Phases Chart ─── */
function MatchPhasesChart() {
  // Single connected line with color-coded segments per phase
  const points = [
    { label: "Start", value: 75, color: "#4aaf10", effLabel: "75% eff." },
    { label: "Pre-interval", value: 60, color: "#23a3e9", effLabel: "63% eff." },
    { label: "Championship", value: 66, color: "#f38b1c", effLabel: "66% eff." },
    { label: "End-game", value: 64, color: "#e92323", effLabel: "64% eff." },
  ];

  const yTicks = [80, 70, 60, 50, 40, 30];
  const yMin = 25;
  const yMax = 85;
  const chartW = 300;
  const chartH = 260;
  const padT = 12;
  const padB = 12;
  const padL = 10;
  const padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  function toX(i: number) {
    return padL + (i / (points.length - 1)) * plotW;
  }
  function toY(val: number) {
    return padT + ((yMax - val) / (yMax - yMin)) * plotH;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Chart card */}
      <div className="bg-[#f5f5f5] rounded-xl p-4 w-full">
        <div className="flex w-full">
          {/* Y-axis labels */}
          <div className="relative shrink-0 pr-1" style={{ height: chartH, width: 55 }}>
            {yTicks.map((val) => (
              <span
                key={val}
                className="absolute text-xs font-normal text-[#cfcfcf] leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  top: toY(val) - 6,
                  left: 0,
                }}
              >
                {val}% eff.
              </span>
            ))}
          </div>

          {/* Chart SVG */}
          <div className="flex-1">
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
              {/* Grid lines */}
              {yTicks.map((val) => (
                <line
                  key={val}
                  x1={padL}
                  y1={toY(val)}
                  x2={chartW - padR}
                  y2={toY(val)}
                  stroke="#e8e8e8"
                  strokeWidth={1}
                />
              ))}
              {/* Color-coded line segments */}
              {points.map((pt, i) => {
                if (i === 0) return null;
                const prev = points[i - 1];
                return (
                  <line
                    key={i}
                    x1={toX(i - 1)}
                    y1={toY(prev.value)}
                    x2={toX(i)}
                    y2={toY(pt.value)}
                    stroke={pt.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Dots */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={toX(i)}
                  cy={toY(pt.value)}
                  r={5}
                  fill={pt.color}
                />
              ))}
              {/* Labels near each dot */}
              {points.map((pt, i) => {
                const x = toX(i);
                const y = toY(pt.value);
                // Position label: above-right for most, adjust to avoid overlap
                const labelX = i === 0 ? x + 12 : i === 1 ? x - 5 : x - 5;
                const labelY = i === 0 ? y - 12 : i === 1 ? y + 20 : y - 14;
                return (
                  <text
                    key={i}
                    x={labelX}
                    y={labelY}
                    fill={pt.color}
                    fontSize={14}
                    fontWeight={500}
                    fontFamily="var(--font-dm-sans), DM Sans, sans-serif"
                  >
                    {pt.effLabel}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* X-axis phase bars */}
      <div className="flex w-full rounded-lg overflow-hidden">
        {points.map((pt) => (
          <div
            key={pt.label}
            className="flex-1 py-2 text-center text-xs font-medium text-white"
            style={{ backgroundColor: pt.color, fontFamily: "var(--font-dm-sans)" }}
          >
            {pt.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tempo Shot Tile ─── */
function ShotTile({
  name,
  eff,
  effColor,
  count,
  buttonLabel,
  onView,
}: {
  name: string;
  eff: string;
  effColor: string;
  count: string;
  buttonLabel: string;
  onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[#eee] flex flex-col gap-2 p-2 rounded-lg flex-1 min-w-[140px]">
      <div className="flex flex-col gap-1">
        <span
          className="text-xs font-semibold text-[var(--text-heading,#161616)]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {name}
        </span>
        <div className="flex gap-2 items-center">
          <span
            className="text-xs font-normal"
            style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}
          >
            {eff}
          </span>
          <div className="w-1 h-1 rounded-full bg-[#868686]" />
          <span
            className="text-xs font-normal text-[#868686]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {count}
          </span>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Predictable Pattern Card ─── */
function PredictablePatternCard({
  effLabel,
  effColor,
  oppAction,
  yourAction,
  count,
  buttonLabel,
  onView,
}: {
  effLabel: string;
  effColor: string;
  oppAction: string;
  yourAction: string;
  count: string;
  buttonLabel: string;
  onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex items-center justify-between w-full">
        <span
          className="text-base font-semibold tracking-[-0.4px]"
          style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}
        >
          {effLabel}
        </span>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <div className="bg-[#fcd4d9] flex items-center justify-center px-2 rounded">
            <span
              className="text-xs font-normal text-[#a22618] leading-[1.6]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Opp
            </span>
          </div>
          <span
            className="text-xs font-medium text-[#383838]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {oppAction}
          </span>
          <span className="text-xs font-medium text-[#383838]">→</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#dee5ff] flex items-center justify-center px-2 rounded">
            <span
              className="text-xs font-normal text-[#6141ef] leading-[1.6]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              You
            </span>
          </div>
          <span
            className="text-xs font-medium text-[#383838]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {yourAction}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <span
          className="text-xs font-normal text-[#868686]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {count}
        </span>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Winning/Losing Pattern Card ─── */
function PatternSequenceCard({
  title,
  count,
  description,
  steps,
  buttonLabel,
  onView,
}: {
  title: string;
  count: string;
  description: string;
  steps: { who: "You" | "Opp"; action: string }[];
  buttonLabel: string;
  onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full">
          <span
            className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {title}
          </span>
          <span
            className="text-xs font-normal text-[#868686]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {count}
          </span>
        </div>
        <p
          className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
        {steps.map((step, i) => {
          const isYou = step.who === "You";
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-xs font-medium text-[#383838]">→</span>
              )}
              <div
                className="flex items-center justify-center px-2 rounded"
                style={{ backgroundColor: isYou ? "#dee5ff" : "#fcd4d9" }}
              >
                <span
                  className="text-xs font-normal leading-[1.6]"
                  style={{
                    color: isYou ? "#6141ef" : "#a22618",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {step.who}
                </span>
              </div>
              <span
                className="text-xs font-medium text-[#383838]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {step.action}
              </span>
            </div>
          );
        })}
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

import type { VideoSheetData } from "@/components/VideoSheet";

const TEMPO_TS = [2779/30, 5354/30, 8901/30];
const PRED_TS = [7915/30, 15988/30, 17390/30, 20793/30, 2007/30, 4778/30];
const WIN_TS = [19694/30, 22742/30, 31009/30];
const LOSE_TS = [2007/30, 4778/30, 14486/30];

interface Props {
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function PatternsTab({ onOpenVideo }: Props) {
  const open = (data: VideoSheetData) => onOpenVideo?.(data);
  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        {/* ─── Headline ─── */}
        <p
          className="text-[20px] font-medium leading-[1.32] text-[var(--text-heading,#161616)] tracking-[-0.5px]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          You controlled the pace and won quick exchanges, but your effectiveness
          dropped in pressure situations, especially in the championship and end
          game phases.
        </p>

        {/* ─── Timeline ─── */}
        <div className="flex flex-col items-start w-full">
          {/* 1. RALLY LENGTH */}
          <TimelineSection
            color="orange"
            icon="/icons/timeline-orange.svg"
            label="RALLY LENGTH"
          >
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-3 w-full">
                <RallyCard
                  label="Short Rallies"
                  winRate="64% Win rate"
                  winRateColor="#2dbd1a"
                  barWidthPct="64%"
                  barColor="#2dbd1a"
                  count="18x"
                  description="You dominate quick exchanges by applying immediate pressure and finishing with powerful shots before your opponent can build a rally."
                />
                <RallyCard
                  label="Medium Rallies"
                  winRate="48% Win rate"
                  winRateColor="#ff4e64"
                  barWidthPct="48%"
                  barColor="#ff4e64"
                  count="22x"
                  description="Your opponent has a slight edge in medium length rallies, where your unforced error rate tends to increase."
                />
                <RallyCard
                  label="Long Rallies"
                  winRate="55% Win rate"
                  winRateColor="#2dbd1a"
                  barWidthPct="55%"
                  barColor="#2dbd1a"
                  count="14x"
                  description="You regain control in long rallies, maintaining shot quality to create winners while your opponent's attack fades."
                />
              </div>
              <p
                className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {`Your game is structured to win rallies early or late; extending them into the 5-8 shot range plays slightly to your opponent's advantage.`}
              </p>
            </div>
          </TimelineSection>

          {/* 2. MATCH PHASES */}
          <TimelineSection
            color="orange"
            icon="/icons/timeline-orange.svg"
            label="MATCH PHASES"
          >
            <div className="flex flex-col gap-3 w-full">
              <MatchPhasesChart />
              <p
                className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Your performance broke down under pressure, with your win rate
                dropping from over 60% to just 20% in the end game (19+). This was
                most obvious in medium length rallies during the championship phase
                (15-18).
              </p>
            </div>
          </TimelineSection>

          {/* 3. TEMPO CONTROL */}
          <TimelineSection
            color="orange"
            icon="/icons/timeline-orange.svg"
            label="TEMPO CONTROL"
          >
            <div className="flex flex-col gap-3 w-full">
              {/* Fast & Ineffective */}
              <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
                <span
                  className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Fast &amp; Ineffective Shots
                </span>
                <div className="flex flex-wrap gap-3 w-full">
                  <ShotTile
                    name="Backhand Netkeep"
                    eff="40% Eff."
                    effColor="#ff4e64"
                    count="3x"
                    buttonLabel="View Backhand Push"
                    onView={() => open({ title: "Backhand Netkeep", subtitle: "40% Eff.", timestamps: TEMPO_TS, sectionLabel: "TEMPO CONTROL" })}
                  />
                  <ShotTile
                    name="Flat Game"
                    eff="40% Eff."
                    effColor="#ff4e64"
                    count="3x"
                    buttonLabel="View Flat Game"
                    onView={() => open({ title: "Flat Game", subtitle: "40% Eff.", timestamps: TEMPO_TS, sectionLabel: "TEMPO CONTROL" })}
                  />
                </div>
              </div>

              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />

              {/* Slow & Ineffective */}
              <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
                <span
                  className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Slow &amp; Ineffective Shots
                </span>
                <div className="flex flex-wrap gap-3 w-full">
                  <ShotTile
                    name="Forhand Smash"
                    eff="40% Eff."
                    effColor="#ff4e64"
                    count="3x"
                    buttonLabel="View Backhand Push"
                    onView={() => open({ title: "Forehand Smash", subtitle: "40% Eff.", timestamps: TEMPO_TS, sectionLabel: "TEMPO CONTROL" })}
                  />
                  <ShotTile
                    name="Overhead Clear"
                    eff="23% Eff."
                    effColor="#ff4e64"
                    count="1x"
                    buttonLabel="View Flat Game"
                    onView={() => open({ title: "Overhead Clear", subtitle: "23% Eff.", timestamps: TEMPO_TS.slice(0,1), sectionLabel: "TEMPO CONTROL" })}
                  />
                </div>
                <ShotTile
                  name="Backhand Push"
                  eff="32% Eff."
                  effColor="#ff4e64"
                  count="1x"
                  buttonLabel="View Flat Game"
                  onView={() => open({ title: "Backhand Push", subtitle: "32% Eff.", timestamps: TEMPO_TS.slice(0,1), sectionLabel: "TEMPO CONTROL" })}
                />
              </div>

              <p
                className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                You controlled the pace in more rallies than your opponent. Your
                backhand defense and flat game shots were key to increasing the pace
                and putting your opponent on the back foot.
              </p>
            </div>
          </TimelineSection>

          {/* 4. PREDICTABLE PATTERNS */}
          <TimelineSection
            color="orange"
            icon="/icons/timeline-orange.svg"
            label="PREDICTABLE PATTERNS"
          >
            <div className="flex flex-col gap-3 w-full">
              {/* Warning badge */}
              <div className="flex gap-2.5 items-center p-2 rounded-lg w-full bg-[rgba(231,157,28,0.1)]">
                <div className="relative flex items-center justify-center w-[49px] h-[49px] shrink-0">
                  <div className="absolute inset-0">
                    <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24.5 0C38.031 0 49 10.969 49 24.5C49 38.031 38.031 49 24.5 49C10.969 49 0 38.031 0 24.5C0 10.969 10.969 0 24.5 0ZM24.5 3.267C12.773 3.267 3.267 12.773 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.773 36.227 3.267 24.5 3.267Z" fill="white"/>
                      <path d="M24.5 0C30.403 0 36.108 2.131 40.565 6.002C45.021 9.872 47.931 15.222 48.758 21.066C49.585 26.911 48.275 32.858 45.068 37.814C41.86 42.769 36.971 46.399 31.3 48.037C25.629 49.675 19.557 49.212 14.201 46.731C8.845 44.249 4.564 39.917 2.148 34.531C-0.269 29.146 -0.66 23.069 1.046 17.418C2.752 11.767 6.441 6.922 11.435 3.774L13.176 6.536C7.222 10.298 3.267 16.937 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.956 36.522 3.564 25.048 3.273L24.5 3.267V0Z" fill="#e79d1c"/>
                    </svg>
                  </div>
                  <span
                    className="relative text-xs font-semibold text-[#e79d1c] text-center"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    18%
                  </span>
                </div>
                <p
                  className="text-sm font-normal text-[#e79d1c] leading-[1.4]"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Moderate risk
                </p>
              </div>

              <PredictablePatternCard
                effLabel="65% Eff."
                effColor="#2dc535"
                oppAction="Serve Middle"
                yourAction="Netkeep"
                count="17/26"
                buttonLabel="View Netkeep"
                onView={() => open({ title: "Netkeep", subtitle: "65% Eff.", description: "Serve Middle → Netkeep pattern (17/26 instances)", timestamps: PRED_TS, sectionLabel: "PREDICTABLE PATTERNS" })}
              />

              <PredictablePatternCard
                effLabel="62% Eff."
                effColor="#2dc535"
                oppAction="Backhand Dribble"
                yourAction="Dribble"
                count="17/26"
                buttonLabel="View Netkeep"
                onView={() => open({ title: "Dribble", subtitle: "62% Eff.", description: "Backhand Dribble → Dribble pattern (17/26 instances)", timestamps: PRED_TS, sectionLabel: "PREDICTABLE PATTERNS" })}
              />

              <p
                className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {`After your opponent's pulldrop, you lift the shuttle 50% of the time with only 53% effectiveness. This predictable response gives away the attack without applying sufficient pressure.`}
              </p>
            </div>
          </TimelineSection>

          {/* 5. WINNING PATTERNS */}
          <TimelineSection
            color="green"
            icon="/icons/timeline-green.svg"
            label="WINNING PATTERNS"
          >
            <PatternSequenceCard
              title="Weathering the storm to force an error"
              count="3x"
              description="You won points by weathering two waves of attack. After your initial defense, you played a solid reset shot that tipped the rally in your favor, eventually pressuring your opponent into a net error."
              steps={[
                { who: "Opp", action: "Serve" },
                { who: "You", action: "Pressure" },
                { who: "Opp", action: "Reset" },
                { who: "You", action: "Reset" },
                { who: "Opp", action: "Attack" },
              ]}
              buttonLabel="View Winning Pattern"
              onView={() => open({ title: "Weathering the Storm", subtitle: "Winning", description: "You won points by weathering two waves of attack. After your initial defense, you played a solid reset shot that tipped the rally in your favor.", timestamps: WIN_TS, sectionLabel: "WINNING PATTERNS" })}
            />
          </TimelineSection>

          {/* 6. LOSING OPENINGS */}
          <TimelineSection
            color="red"
            icon="/icons/timeline-red.svg"
            label="LOSING OPENINGS"
            isLast
          >
            <PatternSequenceCard
              title="Weathering the storm to force an error"
              count="3x"
              description="You won points by weathering two waves of attack. After your initial defense, you played a solid reset shot that tipped the rally in your favor, eventually pressuring your opponent into a net error."
              steps={[
                { who: "Opp", action: "Serve" },
                { who: "You", action: "Pressure" },
                { who: "Opp", action: "Reset" },
                { who: "You", action: "Reset" },
                { who: "Opp", action: "Attack" },
              ]}
              buttonLabel="View Losing Pattern"
              onView={() => open({ title: "Weathering the Storm", subtitle: "Losing", description: "You lost control when drawn into extended exchanges, often being forced to lift weakly.", timestamps: LOSE_TS, sectionLabel: "LOSING OPENINGS" })}
            />
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
