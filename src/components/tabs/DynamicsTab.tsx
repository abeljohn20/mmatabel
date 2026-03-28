"use client";

import Image from "next/image";
import type { MatchReport, Narrative } from "@/lib/types";
import type { VideoSheetData } from "@/components/VideoSheet";
import { formatStroke } from "@/lib/utils";
import { ViewButton } from "@/components/ViewButton";

/* ─── Timeline Section Wrapper (shared pattern) ─── */
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
              style={{ color: labelColor }}
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

/* ─── Play Icon SVG ─── */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.33 3.33L12 8L5.33 12.67V3.33Z" fill="white" />
    </svg>
  );
}

/* ─── Streak Bar ─── */
function StreakBar({
  playerLabel,
  opponentLabel,
  onClickPlayer,
  onClickOpponent,
}: {
  playerLabel: string;
  opponentLabel: string;
  onClickPlayer?: () => void;
  onClickOpponent?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 p-1 w-full">
      {/* You label */}
      <div className="flex items-center justify-center px-2 rounded bg-[#dfefff] self-start">
        <span className="text-[10px] font-normal text-[#2990fd] leading-[1.6]">You</span>
      </div>

      {/* Bar track */}
      <div className="relative h-[31px] w-full rounded bg-[#eee]">
        {/* Player streak block */}
        <div className="absolute flex flex-col gap-0.5 items-center" style={{ left: "30%", top: -21, width: "22%" }}>
          <span className="text-xs font-medium text-[#2990fd] leading-[1.6] text-center w-full">{playerLabel}</span>
          <button
            type="button"
            onClick={onClickPlayer}
            className="bg-[#3e95f3] border border-[#111d69] h-8 rounded w-full flex items-center justify-center cursor-pointer active:opacity-80"
          >
            <PlayIcon />
          </button>
        </div>
        {/* Opponent streak blocks */}
        <div className="absolute flex flex-col gap-0.5 items-center" style={{ left: "52%", top: 0, width: "24%" }}>
          <button
            type="button"
            onClick={onClickOpponent}
            className="bg-[#f5364d] border border-[#a22618] h-8 rounded w-full flex items-center justify-center cursor-pointer active:opacity-80"
          >
            <PlayIcon />
          </button>
          <span className="text-xs font-medium text-[#f5364d] leading-[1.6] text-center w-full">{opponentLabel}</span>
        </div>
      </div>

      {/* Opp label */}
      <div className="flex items-center justify-center px-2 rounded bg-[#fcd4d9] self-start">
        <span className="text-[10px] font-normal text-[#a22618] leading-[1.6]">Opp</span>
      </div>
    </div>
  );
}

/* ─── Trigger Shot Card (positive or negative) ─── */
function TriggerShotCard({
  badge,
  badgeBg,
  badgeBorder,
  badgeColor,
  shotName,
  normalEff,
  normalEffColor,
  pressureEff,
  pressureEffColor,
  arrowColor,
  description,
  buttonLabel,
  onClickView,
}: {
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  shotName: string;
  normalEff: string;
  normalEffColor: string;
  pressureEff: string;
  pressureEffColor: string;
  arrowColor: string;
  description: string;
  buttonLabel: string;
  onClickView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div
          className="flex items-center justify-center px-2 py-0.5 rounded w-fit border"
          style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}
        >
          <span className="text-xs font-medium" style={{ color: badgeColor }}>{badge}</span>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]">
              {shotName}
            </span>
            <div className="flex gap-2 items-center justify-end">
              <span className="text-xs font-semibold" style={{ color: normalEffColor }}>
                {normalEff}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.33 8h9.34" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.67 4L12.67 8L8.67 12" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: pressureEffColor }}>
                {pressureEff}
              </span>
            </div>
          </div>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full">
            {description}
          </p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onClickView} />
    </div>
  );
}

/* ─── Opponent Pressure Card ─── */
function OpponentPressureCard({
  badge,
  badgeBg,
  badgeBorder,
  badgeColor,
  title,
  description,
  buttonLabel,
  onClickView,
}: {
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClickView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div
          className="flex items-center justify-center px-2 py-0.5 rounded w-fit border"
          style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}
        >
          <span className="text-xs font-medium" style={{ color: badgeColor }}>{badge}</span>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]">
            {title}
          </span>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full">
            {description}
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
  analysisView?: "your" | "opponent";
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function DynamicsTab({ report, narrative, analysisView = "your", onOpenVideo }: Props) {
  const md = report.deep_match_report.match_dynamics;
  const narr = narrative.section_narratives.pressure_dynamics;
  const pp = md.pressure_profile;

  const openStreakVideo = (tp: { moment: string; insight: string; evidence?: { rally_frames: number[] | null } }) => {
    if (!onOpenVideo) return;
    onOpenVideo({
      title: tp.moment,
      description: tp.insight,
      timestamps: tp.evidence?.rally_frames?.map((f: number) => f / 30) ?? [],
      sectionLabel: "STREAKS",
    });
  };

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        {/* ─── Headline ─── */}
        <p className="text-[20px] font-medium leading-[1.32] text-[var(--text-heading,#161616)] tracking-[-0.5px]">
          {narr.dynamics_headline || "Match Dynamics"}
        </p>

        {/* ─── Timeline ─── */}
        <div className="flex flex-col items-start w-full">

          {/* 1. STREAKS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="STREAKS">
            <div className="flex flex-col gap-3 w-full">
              {narr.turning_points && narr.turning_points.map((tp: { moment: string; insight: string; evidence?: { rally_frames: number[] | null; trigger_shot: string | null; impact_score: number } }, i: number) => {
                const scoreBefore = tp.moment.match(/from (\S+)/)?.[1] ?? "";
                const scoreAfter = tp.moment.match(/to (\S+)/)?.[1] ?? "";
                const gameLabel = tp.moment.includes("Game") ? tp.moment.split(",")[0] : `Game ${i + 1}`;

                return (
                  <div key={i} className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[var(--stroke-st-elv2,#eee)] flex flex-col gap-4 p-2 rounded-lg shadow-[0px_4px_7.8px_0px_rgba(186,186,186,0.25)] w-full">
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-lg font-semibold text-[var(--text-heading,#161616)] tracking-[-1px] leading-[1.2]">
                        {gameLabel}
                      </span>
                      <p className="text-sm font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.4] w-full">
                        {tp.insight}
                      </p>
                    </div>

                    {/* Streak visualization bar — play buttons open video sheet */}
                    <StreakBar
                      playerLabel={scoreBefore}
                      opponentLabel={scoreAfter}
                      onClickPlayer={() => openStreakVideo(tp)}
                      onClickOpponent={() => openStreakVideo(tp)}
                    />
                  </div>
                );
              })}
              {(!narr.turning_points || narr.turning_points.length === 0) && (
                <p className="text-xs text-[var(--text-subtext,#6d6d6d)]">No significant streaks identified.</p>
              )}
            </div>
          </TimelineSection>

          {/* 2. TRIGGER SHOTS */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="TRIGGER SHOTS">
            <div className="flex flex-col gap-3 w-full">
              {narr.rally_level_turning_points_insight && (
                <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">
                  {narr.rally_level_turning_points_insight}
                </p>
              )}

              {pp.clutch_shots.map((s: any, i: number) => (
                <TriggerShotCard
                  key={`clutch-${i}`}
                  badge="Positive trigger shot"
                  badgeBg="rgba(117, 235, 62, 0.19)"
                  badgeBorder="#bdf6c0"
                  badgeColor="#359707"
                  shotName={formatStroke(s.stroke)}
                  normalEff={`${s.normal_eff?.toFixed(0) ?? s.crucial_eff?.toFixed(0)}% Eff.`}
                  normalEffColor="#2dbd1a"
                  pressureEff={`${s.crucial_eff?.toFixed(0) ?? "—"}% Eff.`}
                  pressureEffColor="#2dbd1a"
                  arrowColor="#2dbd1a"
                  description={
                    narr.clutch_shots?.find((c: any) => (c.shot || "").replace(/_/g, " ").toLowerCase() === s.stroke.replace(/_/g, " ").toLowerCase())?.insight
                    ?? `Effectiveness jumps from ${s.normal_eff?.toFixed(0)}% to ${s.crucial_eff?.toFixed(0)}% under pressure.`
                  }
                  buttonLabel={`View ${formatStroke(s.stroke)}`}
                  onClickView={
                    onOpenVideo
                      ? () => onOpenVideo({
                          title: formatStroke(s.stroke),
                          subtitle: `+${s.delta.toFixed(1)} delta`,
                          description: `${s.n_crucial} crucial shots under pressure with elevated effectiveness.`,
                          timestamps: [],
                          sectionLabel: "TRIGGER SHOTS",
                        })
                      : undefined
                  }
                />
              ))}

              {pp.clutch_shots.length > 0 && pp.fragile_shots.length > 0 && (
                <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              )}

              {pp.fragile_shots.map((s: any, i: number) => (
                <TriggerShotCard
                  key={`fragile-${i}`}
                  badge="Negative trigger shot"
                  badgeBg="rgba(255, 78, 100, 0.17)"
                  badgeBorder="#ff4e64"
                  badgeColor="#ff4e64"
                  shotName={formatStroke(s.stroke)}
                  normalEff={`${s.normal_eff?.toFixed(0) ?? "—"}% Eff.`}
                  normalEffColor="#2dbd1a"
                  pressureEff={`${s.crucial_eff?.toFixed(0) ?? "—"}% Eff.`}
                  pressureEffColor="#ff4e64"
                  arrowColor="#ff4e64"
                  description={
                    narr.fragile_shots?.find((f: any) => (f.shot || "").replace(/_/g, " ").toLowerCase() === s.stroke.replace(/_/g, " ").toLowerCase())?.insight
                    ?? `Effectiveness drops from ${s.normal_eff?.toFixed(0)}% to ${s.crucial_eff?.toFixed(0)}% under pressure.`
                  }
                  buttonLabel={`View ${formatStroke(s.stroke)}`}
                  onClickView={
                    onOpenVideo
                      ? () => onOpenVideo({
                          title: formatStroke(s.stroke),
                          subtitle: `${s.delta.toFixed(1)} delta`,
                          description: `${s.n_crucial} crucial shots where effectiveness dropped under pressure.`,
                          timestamps: [],
                          sectionLabel: "TRIGGER SHOTS",
                        })
                      : undefined
                  }
                />
              ))}
            </div>
          </TimelineSection>

          {/* 3. LEADING V/S TRAILING */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="LEADING V/S TRAILING">
            <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">
              {narr.score_state?.leading_vs_trailing
                ?? `You are significantly more effective when trailing (${pp.score_state?.trailing?.avg_eff?.toFixed(0) ?? "—"}%) than when leading (${pp.score_state?.leading?.avg_eff?.toFixed(0) ?? "—"}%). This suggests you play with more focus when chasing the score but may relax or become predictable when you have a lead.`}
            </p>
          </TimelineSection>

          {/* 4. OPPONENT PRESSURE */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="OPPONENT PRESSURE" isLast>
            <div className="flex flex-col gap-3 w-full">
              {narr.opponent_pressure?.headline && (
                <p className="text-sm font-medium leading-[1.4] text-[var(--text-heading,#161616)] w-full">
                  {narr.opponent_pressure.headline}
                </p>
              )}

              {narr.opponent_pressure?.clutch_tendencies && (
                <OpponentPressureCard
                  badge="Clutch tendencies"
                  badgeBg="rgba(117, 235, 62, 0.19)"
                  badgeBorder="#bdf6c0"
                  badgeColor="#359707"
                  title="Rally Extension"
                  description={narr.opponent_pressure.clutch_tendencies}
                  buttonLabel="View Evidence"
                  onClickView={
                    onOpenVideo
                      ? () => onOpenVideo({
                          title: "Opponent Clutch Tendencies",
                          description: narr.opponent_pressure.clutch_tendencies,
                          timestamps: [],
                          sectionLabel: "OPPONENT PRESSURE",
                        })
                      : undefined
                  }
                />
              )}

              {narr.opponent_pressure?.clutch_tendencies && narr.opponent_pressure?.fragile_tendencies && (
                <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              )}

              {narr.opponent_pressure?.fragile_tendencies && (
                <OpponentPressureCard
                  badge="Fragile tendencies"
                  badgeBg="rgba(255, 78, 100, 0.17)"
                  badgeBorder="#ff4e64"
                  badgeColor="#ff4e64"
                  title="Unforced Errors"
                  description={narr.opponent_pressure.fragile_tendencies}
                  buttonLabel="View Evidence"
                  onClickView={
                    onOpenVideo
                      ? () => onOpenVideo({
                          title: "Opponent Fragile Tendencies",
                          description: narr.opponent_pressure.fragile_tendencies,
                          timestamps: [],
                          sectionLabel: "OPPONENT PRESSURE",
                        })
                      : undefined
                  }
                />
              )}

              {narr.opponent_pressure?.fragile_tendencies && narr.opponent_pressure?.championship_performance && (
                <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              )}

              {narr.opponent_pressure?.championship_performance && (
                <OpponentPressureCard
                  badge="Championship performance"
                  badgeBg="rgba(211, 160, 255, 0.17)"
                  badgeBorder="#ac4eff"
                  badgeColor="#ac4eff"
                  title="Steady Performance"
                  description={narr.opponent_pressure.championship_performance}
                  buttonLabel="View Evidence"
                  onClickView={
                    onOpenVideo
                      ? () => onOpenVideo({
                          title: "Opponent Championship Performance",
                          description: narr.opponent_pressure.championship_performance,
                          timestamps: [],
                          sectionLabel: "OPPONENT PRESSURE",
                        })
                      : undefined
                  }
                />
              )}
            </div>
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
