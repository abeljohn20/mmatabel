"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ViewButton } from "@/components/ViewButton";
import { NarrativeText, Headline } from "@/components/Narrative";
import type { VideoSheetData } from "@/components/VideoSheet";

/* ─── Timeline Section Wrapper ─── */
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
          <div className="flex-1 w-px min-h-0" style={{ backgroundColor: lineColor }} />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex gap-3 items-center w-full">
            <span className="text-sm font-normal whitespace-nowrap" style={{ color: labelColor, fontFamily: "var(--font-dm-sans)" }}>
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

/* ─── Warning Circle SVG ─── */
function WarningCircleSvg({ color = "#d33030" }: { color?: string }) {
  return (
    <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.5 0C38.031 0 49 10.969 49 24.5C49 38.031 38.031 49 24.5 49C10.969 49 0 38.031 0 24.5C0 10.969 10.969 0 24.5 0ZM24.5 3.267C12.773 3.267 3.267 12.773 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.773 36.227 3.267 24.5 3.267Z" fill="white"/>
      <path d="M24.5 0C30.403 0 36.108 2.131 40.565 6.002C45.021 9.872 47.931 15.222 48.758 21.066C49.585 26.911 48.275 32.858 45.068 37.814C41.86 42.769 36.971 46.399 31.3 48.037C25.629 49.675 19.557 49.212 14.201 46.731C8.845 44.249 4.564 39.917 2.148 34.531C-0.269 29.146 -0.66 23.069 1.046 17.418C2.752 11.767 6.441 6.922 11.435 3.774L13.176 6.536C7.222 10.298 3.267 16.937 3.267 24.5C3.267 36.227 12.773 45.733 24.5 45.733C36.227 45.733 45.733 36.227 45.733 24.5C45.733 12.956 36.522 3.564 25.048 3.273L24.5 3.267V0Z" fill={color}/>
    </svg>
  );
}

/* ─── Predictability Warning Badge ─── */
function PredictabilityWarning({ percentage, message, variant = "danger" }: { percentage: string; message: string; variant?: "danger" | "warning" }) {
  const ringColor = variant === "warning" ? "#e79d1c" : "#d33030";
  const bgColor = variant === "warning" ? "rgba(231,157,28,0.1)" : "rgba(211,48,48,0.1)";
  const textColor = variant === "warning" ? "#e79d1c" : "#d33030";
  const messageColor = variant === "warning" ? "#e79d1c" : "#9f0c0c";

  return (
    <div className="flex gap-2.5 items-center p-2 rounded-lg w-full" style={{ backgroundColor: bgColor }}>
      <div className="relative flex items-center justify-center w-[49px] h-[49px] shrink-0">
        <div className="absolute inset-0"><WarningCircleSvg color={ringColor} /></div>
        <span className="relative text-xs font-semibold text-center" style={{ color: textColor, fontFamily: "var(--font-dm-sans)" }}>{percentage}</span>
      </div>
      <p className="text-sm font-normal leading-[1.4]" style={{ color: messageColor, fontFamily: "var(--font-dm-sans)" }}>{message}</p>
    </div>
  );
}

/* ─── Progress Bar Row (for serve bars) ─── */
function ServeBar({ label, winRateLabel, winRate, pct, count }: { label: string; winRateLabel: string; winRate: number; pct: number; count: string }) {
  const effColor = winRate >= 0.5 ? "#2dbd1a" : winRate >= 0.4 ? "#f59e0b" : "#ff4e64";
  const barColor = pct >= 75 ? "rgb(255, 51, 51)" : pct >= 50 ? "rgb(220, 200, 20)" : "#2dbd1a";
  const barWidth = `${Math.min(100, pct)}%`;

  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] flex flex-col gap-2 px-3 py-2 rounded-lg overflow-hidden w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-[#383838]" style={{ fontFamily: "var(--font-dm-sans)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{winRateLabel}</span>
      </div>
      <div className="flex items-center justify-between w-full h-5">
        <div className="bg-[#e3e3e3] h-1 rounded-full overflow-hidden flex-1 mr-3">
          <div className="h-1 rounded-[15px]" style={{ width: barWidth, background: barColor }} />
        </div>
        <span className="text-xs font-normal text-[#868686] text-center" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
      </div>
    </div>
  );
}

/* ─── Receive Card (Best / Worst) ─── */
function ReceiveCard({ badge, badgeStyle, shotName, effLabel, effValue, description, buttonLabel, onView }: {
  badge: string; badgeStyle: "success" | "danger"; shotName: string; effLabel: string; effValue: number; description: string; buttonLabel: string; onView?: () => void;
}) {
  const isSuccess = badgeStyle === "success";
  const badgeBg = isSuccess ? "rgba(117, 235, 62, 0.19)" : "rgba(255, 78, 100, 0.17)";
  const badgeBorder = isSuccess ? "#bdf6c0" : "#ff4e64";
  const badgeColor = isSuccess ? "#359707" : "#ff4e64";
  const effColor = effValue >= 65 ? "#2dbd1a" : effValue >= 45 ? "#f59e0b" : "#ff4e64";

  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-center px-2 py-0.5 rounded w-fit border" style={{ backgroundColor: badgeBg, borderColor: badgeBorder }}>
          <span className="text-xs font-medium" style={{ color: badgeColor, fontFamily: "var(--font-dm-sans)" }}>{badge}</span>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{shotName}</span>
            <span className="text-xs font-semibold" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{effLabel}</span>
          </div>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Receive Predictability Row ─── */
function ReceivePredictabilityRow({ label, effLabel, effValue, pct, count, buttonLabel, onView }: {
  label: string; effLabel: string; effValue: number; pct: number; count: string; buttonLabel: string; onView?: () => void;
}) {
  const effColor = effValue >= 65 ? "#2dbd1a" : effValue >= 45 ? "#f59e0b" : "#ff4e64";
  const barColor = pct >= 50 ? "rgb(255, 51, 51)" : pct >= 30 ? "rgb(220, 200, 20)" : "#2dbd1a";
  const barWidth = `${Math.min(100, pct)}%`;

  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] flex flex-col gap-3 px-3 py-2 rounded-lg overflow-hidden w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap items-center justify-between w-full gap-y-1">
          <span className="text-sm font-medium text-[#383838]" style={{ fontFamily: "var(--font-dm-sans)" }}>{label}</span>
          <span className="text-xs font-semibold" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{effLabel}</span>
        </div>
        <div className="flex items-center justify-between w-full h-5">
          <div className="bg-[#e3e3e3] h-1 rounded-full overflow-hidden flex-1 mr-3">
            <div className="h-1 rounded-[15px]" style={{ width: barWidth, background: barColor }} />
          </div>
          <span className="text-xs font-normal text-[#868686] text-center" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Sequence Step Row ─── */
function SequenceStep({ who, action, effLabel, effColor }: { who: "You" | "Opp"; action: string; effLabel: string; effColor: string }) {
  const isYou = who === "You";
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-2 items-start">
        <div className="flex items-center justify-center px-2 rounded" style={{ backgroundColor: isYou ? "#dee5ff" : "#fcd4d9" }}>
          <span className="text-xs font-normal leading-[1.6]" style={{ color: isYou ? "#6141ef" : "#a22618", fontFamily: "var(--font-dm-sans)" }}>{who}</span>
        </div>
        <span className="text-xs font-normal text-black leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>{action}</span>
      </div>
      {effLabel && (
        <span className="text-xs font-semibold" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{effLabel}</span>
      )}
    </div>
  );
}

/* ─── Sequence Card (Winning / Losing) ─── */
function SequenceCard({ title, effLabel, effColor, count, description, steps, buttonLabel, onView }: {
  title: string; effLabel: string; effColor: string; count: string; description: string;
  steps: { who: "You" | "Opp"; action: string; eff_label: string; eff_color: string }[];
  buttonLabel: string; onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[var(--stroke-st-elv1,#f5f5f5)] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</span>
            <div className="flex gap-2 items-center justify-end">
              <span className="text-xs font-semibold" style={{ color: effColor, fontFamily: "var(--font-dm-sans)" }}>{effLabel}</span>
              <div className="w-1 h-1 rounded-full bg-[#868686]" />
              <span className="text-xs font-normal text-[#868686] text-center" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
            </div>
          </div>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {steps.map((step, i) => (
          <SequenceStep key={i} who={step.who as "You" | "Opp"} action={step.action} effLabel={step.eff_label} effColor={step.eff_color} />
        ))}
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

interface Props {
  analysisView?: "your" | "opponent";
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function OpeningPhaseTab({ analysisView = "your", onOpenVideo }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/opening_phase_lakshya_lishifeng.json")
      .then((r) => r.json())
      .then((d) => { setData(d.opening_phase); setLoading(false); })
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

  const sp = activeData.serve_predictability;
  const rg = activeData.receive_game;
  const rp = activeData.receive_predictability;
  const headline = activeData.headline?.startsWith("[narrative")
    ? (analysisView === "opponent"
      ? "Opponent opening phase analysis — serve patterns, receive responses, and key sequences."
      : "Your opening phase analysis — serve patterns, receive responses, and key sequences.")
    : activeData.headline;

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        {/* ─── Headline ─── */}
        <Headline>{headline}</Headline>

        {/* ─── Timeline ─── */}
        <div className="flex flex-col items-start w-full">
          {/* 1. SERVE PREDICTABILITY */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="SERVE PREDICTABILITY">
            <div className="flex flex-col gap-2 w-full">
              <PredictabilityWarning percentage={sp.percentage} message={sp.message} variant={sp.variant} />
              {sp.serve_bars.map((bar: any, i: number) => (
                <ServeBar key={i} label={bar.label} winRateLabel={bar.win_rate_label} winRate={bar.win_rate} pct={bar.pct} count={bar.count} />
              ))}
            </div>
            <NarrativeText>
              {sp.insight_text?.startsWith("[narrative") ? `Serve predictability is at ${sp.percentage}.` : sp.insight_text}
            </NarrativeText>
          </TimelineSection>

          {/* 2. SERVE INSIGHT */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="SERVE INSIGHT">
            <NarrativeText>
              {activeData.serve_insight?.startsWith("[narrative") ? "Serve insight will be available with narrative analysis." : activeData.serve_insight}
            </NarrativeText>
          </TimelineSection>

          {/* 3. RECEIVE GAME */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="RECEIVE GAME">
            <div className="flex flex-col gap-3 w-full">
              <ReceiveCard
                badge={rg.best.badge}
                badgeStyle={rg.best.badge_style}
                shotName={rg.best.shot_name}
                effLabel={rg.best.eff_label}
                effValue={rg.best.eff_value}
                description={rg.best.description?.startsWith("[narrative") ? `${rg.best.shot_name} is your most effective receive option.` : rg.best.description}
                buttonLabel={rg.best.button_label}
                onView={() => open({ title: rg.best.shot_name, subtitle: rg.best.eff_label, description: rg.best.description, timestamps: rg.best.timestamps_seconds || [], sectionLabel: "RECEIVE GAME", badge: "Best receive", badgeBg: "rgba(117,235,62,0.19)", badgeBorder: "#bdf6c0", badgeColor: "#359707" })}
              />
              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              <ReceiveCard
                badge={rg.worst.badge}
                badgeStyle={rg.worst.badge_style}
                shotName={rg.worst.shot_name}
                effLabel={rg.worst.eff_label}
                effValue={rg.worst.eff_value}
                description={rg.worst.description?.startsWith("[narrative") ? `${rg.worst.shot_name} is your least effective receive.` : rg.worst.description}
                buttonLabel={rg.worst.button_label}
                onView={() => open({ title: rg.worst.shot_name, subtitle: rg.worst.eff_label, description: rg.worst.description, timestamps: rg.worst.timestamps_seconds || [], sectionLabel: "RECEIVE GAME", badge: "Worst receive", badgeBg: "rgba(255,78,100,0.17)", badgeBorder: "#ff4e64", badgeColor: "#ff4e64" })}
              />
            </div>
          </TimelineSection>

          {/* 4. RECEIVE PREDICTABILITY */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="RECEIVE PREDICTABILITY">
            <div className="flex flex-col gap-3 w-full">
              <PredictabilityWarning percentage={rp.percentage} message={rp.message} variant={rp.variant} />
              {rp.rows.map((row: any, i: number) => (
                <ReceivePredictabilityRow
                  key={i}
                  label={row.label}
                  effLabel={row.eff_label}
                  effValue={row.eff_value}
                  pct={row.pct}
                  count={row.count}
                  buttonLabel={row.button_label}
                  onView={() => open({ title: row.label, subtitle: row.eff_label, description: `${row.label} pattern (${row.count})`, timestamps: row.timestamps_seconds || [], sectionLabel: "RECEIVE PREDICTABILITY" })}
                />
              ))}
            </div>
          </TimelineSection>

          {/* 5. RECEIVE INSIGHT */}
          <TimelineSection color="orange" icon="/icons/timeline-orange.svg" label="RECEIVE INSIGHT">
            <NarrativeText>
              {activeData.receive_insight?.startsWith("[narrative") ? "Receive insight will be available with narrative analysis." : activeData.receive_insight}
            </NarrativeText>
          </TimelineSection>

          {/* 6. WINNING OPENINGS */}
          {activeData.winning_openings.length > 0 && (
            <TimelineSection color="green" icon="/icons/timeline-green.svg" label="WINNING OPENINGS" isLast={activeData.losing_openings.length === 0}>
              <NarrativeText>
                {activeData.winning_openings_insight?.startsWith("[narrative") || !activeData.winning_openings_insight
                  ? "Winning sequence pattern."
                  : activeData.winning_openings_insight}
              </NarrativeText>
              {activeData.winning_openings.map((seq: any, i: number) => (
                <SequenceCard
                  key={i}
                  title={seq.title}
                  effLabel={seq.eff_label}
                  effColor={seq.eff_color}
                  count={seq.count}
                  description={seq.description?.startsWith("[narrative") ? "Winning sequence pattern." : seq.description}
                  steps={seq.steps}
                  buttonLabel={seq.button_label}
                  onView={() => open({ title: seq.title, subtitle: seq.eff_label, description: seq.description, timestamps: seq.timestamps_seconds || [], sectionLabel: "WINNING OPENINGS", count: seq.count, steps: seq.steps })}
                />
              ))}
            </TimelineSection>
          )}

          {/* 7. LOSING OPENINGS */}
          {activeData.losing_openings.length > 0 && (
            <TimelineSection color="red" icon="/icons/timeline-red.svg" label="LOSING OPENINGS" isLast>
              <NarrativeText>
                {activeData.losing_openings_insight?.startsWith("[narrative") || !activeData.losing_openings_insight
                  ? "Losing sequence pattern."
                  : activeData.losing_openings_insight}
              </NarrativeText>
              {activeData.losing_openings.map((seq: any, i: number) => (
                <SequenceCard
                  key={i}
                  title={seq.title}
                  effLabel={seq.eff_label}
                  effColor={seq.eff_color}
                  count={seq.count}
                  description={seq.description?.startsWith("[narrative") ? "Losing sequence pattern." : seq.description}
                  steps={seq.steps}
                  buttonLabel={seq.button_label}
                  onView={() => open({ title: seq.title, subtitle: seq.eff_label, description: seq.description, timestamps: seq.timestamps_seconds || [], sectionLabel: "LOSING OPENINGS", count: seq.count, steps: seq.steps })}
                />
              ))}
            </TimelineSection>
          )}
        </div>
      </div>
    </div>
  );
}
