"use client";

import Image from "next/image";
import { ViewButton } from "@/components/ViewButton";
import { NarrativeText, Headline } from "@/components/Narrative";
import type { VideoSheetData } from "@/components/VideoSheet";

const TS = [2779/30, 5354/30, 8901/30, 15988/30, 19694/30, 22742/30];

/* ─── Timeline Section ─── */
function TimelineSection({ label, children, isLast = false }: {
  label: string; children: React.ReactNode; isLast?: boolean;
}) {
  return (
    <div className="flex flex-col items-start w-full" data-section-id={label}>
      <div className="flex gap-3 items-start w-full">
        <div className="flex flex-col items-center justify-between self-stretch shrink-0">
          <Image src="/icons/timeline-orange.svg" alt="" width={24} height={24} />
          <div className="flex-1 w-px min-h-0 bg-[#ff7441]" />
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex gap-3 items-center w-full">
            <span className="text-sm font-normal whitespace-nowrap text-[var(--brand-orange,#fa642d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>{label}</span>
            <div className="flex-1 h-px bg-[var(--brand-orange,#fa642d)]" />
          </div>
          {children}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center h-8 overflow-hidden px-[11.5px]">
          <div className="w-px h-full bg-[#ff7441]" />
        </div>
      )}
    </div>
  );
}

/* ─── Badge ─── */
function Badge({ text, bg, border, color }: { text: string; bg: string; border: string; color: string }) {
  return (
    <div className="flex items-center justify-center px-2 py-0.5 rounded border w-fit" style={{ backgroundColor: bg, borderColor: border }}>
      <span className="text-xs font-medium whitespace-nowrap" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{text}</span>
    </div>
  );
}

/* ─── Shot Comparison Card ─── */
function ShotComparisonCard({ zoneBadge, title, shotPlayed, shotCount, shotEff, shotEffColor, betterOption, betterEff, betterEffColor, diffLabel, buttonLabel, onView }: {
  zoneBadge: { text: string; bg: string; border: string; color: string };
  title: string;
  shotPlayed: string; shotCount: string; shotEff: string; shotEffColor: string;
  betterOption: string; betterEff: string; betterEffColor: string;
  diffLabel: string;
  buttonLabel: string;
  onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[#f5f5f5] flex flex-col gap-4 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Badge {...zoneBadge} />
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {/* Shot you played */}
          <div className="bg-[var(--bg-elv-2,#f6f6f6)] border border-[#eee] flex items-center justify-between p-2 rounded-lg w-full overflow-hidden">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Shot you played</span>
              <span className="text-sm font-medium text-[#3e3a32]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {shotPlayed} <span className="font-light">({shotCount})</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 text-right w-[102px]">
              <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Effectiveness</span>
              <span className="text-sm font-medium" style={{ color: shotEffColor, fontFamily: "var(--font-dm-sans)" }}>{shotEff}</span>
            </div>
          </div>
          {/* Arrow + diff label */}
          <div className="flex flex-col items-center gap-0.5 w-full">
            <svg width="1" height="16" viewBox="0 0 1 16"><line x1="0.5" y1="0" x2="0.5" y2="16" stroke="#5c5850" strokeDasharray="2 2" /></svg>
            <span className="text-xs font-normal text-[#5c5850] text-center" style={{ fontFamily: "var(--font-dm-sans)" }}>{diffLabel}</span>
            <svg width="6" height="16" viewBox="0 0 6 16"><path d="M3 0V12M0.5 10L3 16L5.5 10" stroke="#5c5850" strokeWidth="1" fill="none" /></svg>
          </div>
          {/* Better option */}
          <div className="bg-white/60 border border-[#eee] flex items-center justify-between p-2 rounded-lg w-full overflow-hidden shadow-[0px_4px_4px_rgba(215,215,215,0.29)]">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Better option</span>
              <span className="text-sm font-medium text-[#3e3a32]" style={{ fontFamily: "var(--font-dm-sans)" }}>{betterOption}</span>
            </div>
            <div className="flex flex-col gap-1 text-right w-[102px]">
              <span className="text-xs font-light text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>Effectiveness</span>
              <span className="text-sm font-medium" style={{ color: betterEffColor, fontFamily: "var(--font-dm-sans)" }}>{betterEff}</span>
            </div>
          </div>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Rally Blueprint Card ─── */
function BlueprintCard({ badges, title, description, buttonLabel, onView }: {
  badges: { text: string; bg: string; border: string; color: string }[];
  title: string; description: string; buttonLabel: string; onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[#f5f5f5] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-start">
          {badges.map((b) => <Badge key={b.text} {...b} />)}
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</span>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ─── Tipping Point Card ─── */
function TippingPointCard({ badge, shotName, count, description, buttonLabel, onView }: {
  badge: { text: string; bg: string; border: string; color: string };
  shotName: string; count: string; description: string; buttonLabel: string; onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[#f5f5f5] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <Badge {...badge} />
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{shotName}</span>
            <span className="text-sm font-normal text-[var(--text-subtext,#6d6d6d)]" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}</span>
          </div>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6]" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

/* ═════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════ */

/* ─── Opponent Tendencies Card (reused from PatternsTab) ─── */
function OpponentTendencyCard({ badge, badgeBg, badgeBorder, badgeColor, title, description, buttonLabel, onView }: {
  badge: string; badgeBg: string; badgeBorder: string; badgeColor: string;
  title: string; description: string; buttonLabel: string; onView?: () => void;
}) {
  return (
    <div className="bg-[var(--bg-elv-1,#fafafa)] border border-[#f5f5f5] flex flex-col gap-3 p-2 rounded-lg w-full">
      <div className="flex flex-col gap-2 w-full">
        <Badge text={badge} bg={badgeBg} border={badgeBorder} color={badgeColor} />
        <div className="flex flex-col gap-1 w-full">
          <span className="text-sm font-semibold text-[var(--text-heading,#161616)] tracking-[-0.5px]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</span>
          <p className="text-xs font-normal text-[var(--text-subtext,#6d6d6d)] leading-[1.6] w-full" style={{ fontFamily: "var(--font-dm-sans)" }}>{description}</p>
        </div>
      </div>
      <ViewButton label={buttonLabel} onClick={onView} />
    </div>
  );
}

interface Props {
  analysisView?: "your" | "opponent";
  narrative?: any;
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function DecisionAnalysisTab({ analysisView = "your", narrative, onOpenVideo }: Props) {
  const open = (data: VideoSheetData) => onOpenVideo?.(data);
  const isOpponent = analysisView === "opponent";
  const oppPressure = narrative?.section_narratives?.pressure_dynamics?.opponent_pressure;

  if (isOpponent) {
    return (
      <div className="bg-white w-full overflow-auto">
        <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
          <Headline>
            Opponent Decision Analysis
          </Headline>
          <div className="flex flex-col items-start w-full">
            {/* RALLY BLUEPRINT */}
            <TimelineSection label="RALLY BLUEPRINT" isLast={!oppPressure}>
              <div className="flex flex-col gap-3 w-full">
                <NarrativeText>
                  Rally blueprint insight
                </NarrativeText>
                <BlueprintCard
                  badges={[
                    { text: "Short Rallies", bg: "#fff6fe", border: "#d7b6d4", color: "#97078b" },
                    { text: "Balanced", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" },
                  ]}
                  title="Opponent balanced approach in long rallies"
                  description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                  buttonLabel="View Evidence"
                  onView={() => open({ title: "Short Rally Blueprint", subtitle: "Balanced", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Short Rallies", bg: "#fff6fe", border: "#d7b6d4", color: "#97078b" }, { text: "Balanced", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" }] })}
                />
                <BlueprintCard
                  badges={[
                    { text: "Medium Rallies", bg: "#f6fcff", border: "#9dcbe3", color: "#3998c8" },
                    { text: "Attack", bg: "rgba(235,62,68,0.19)", border: "#f6bdd8", color: "#97071f" },
                  ]}
                  title="Opponent balanced approach in long rallies"
                  description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                  buttonLabel="View Evidence"
                  onView={() => open({ title: "Medium Rally Blueprint", subtitle: "Attack", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Medium Rallies", bg: "#f6fcff", border: "#9dcbe3", color: "#3998c8" }, { text: "Attack", bg: "rgba(235,62,68,0.19)", border: "#f6bdd8", color: "#97071f" }] })}
                />
                <BlueprintCard
                  badges={[
                    { text: "Long Rallies", bg: "#f0ecff", border: "#cec8eb", color: "#5539c8" },
                    { text: "Defensive", bg: "rgba(166,221,239,0.19)", border: "#dbecfe", color: "#2597cc" },
                  ]}
                  title="Opponent balanced approach in long rallies"
                  description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                  buttonLabel="View Evidence"
                  onView={() => open({ title: "Long Rally Blueprint", subtitle: "Defensive", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Long Rallies", bg: "#f0ecff", border: "#cec8eb", color: "#5539c8" }, { text: "Defensive", bg: "rgba(166,221,239,0.19)", border: "#dbecfe", color: "#2597cc" }] })}
                />
              </div>
            </TimelineSection>

            {/* OPPONENT TENDENCIES (moved from Patterns > Opponent Pressure) */}
            {oppPressure && (
              <TimelineSection label="OPPONENT TENDENCIES" isLast>
                <div className="flex flex-col gap-3 w-full">
                  {oppPressure.headline && (
                    <NarrativeText>
                      {oppPressure.headline}
                    </NarrativeText>
                  )}
                  {oppPressure.clutch_tendencies && (
                    <OpponentTendencyCard
                      badge="Clutch tendencies" badgeBg="rgba(117,235,62,0.19)" badgeBorder="#bdf6c0" badgeColor="#359707"
                      title="Rally Extension" description={oppPressure.clutch_tendencies}
                      buttonLabel="View Evidence"
                      onView={() => open({ title: "Opponent Clutch Tendencies", description: oppPressure.clutch_tendencies, timestamps: [], sectionLabel: "OPPONENT TENDENCIES", badge: "Clutch tendencies", badgeBg: "rgba(117,235,62,0.19)", badgeBorder: "#bdf6c0", badgeColor: "#359707" })}
                    />
                  )}
                  {oppPressure.clutch_tendencies && oppPressure.fragile_tendencies && (
                    <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
                  )}
                  {oppPressure.fragile_tendencies && (
                    <OpponentTendencyCard
                      badge="Fragile tendencies" badgeBg="rgba(255,78,100,0.17)" badgeBorder="#ff4e64" badgeColor="#ff4e64"
                      title="Unforced Errors" description={oppPressure.fragile_tendencies}
                      buttonLabel="View Evidence"
                      onView={() => open({ title: "Opponent Fragile Tendencies", description: oppPressure.fragile_tendencies, timestamps: [], sectionLabel: "OPPONENT TENDENCIES", badge: "Fragile tendencies", badgeBg: "rgba(255,78,100,0.17)", badgeBorder: "#ff4e64", badgeColor: "#ff4e64" })}
                    />
                  )}
                  {oppPressure.fragile_tendencies && oppPressure.championship_performance && (
                    <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
                  )}
                  {oppPressure.championship_performance && (
                    <OpponentTendencyCard
                      badge="Championship performance" badgeBg="rgba(211,160,255,0.17)" badgeBorder="#ac4eff" badgeColor="#ac4eff"
                      title="Steady Performance" description={oppPressure.championship_performance}
                      buttonLabel="View Evidence"
                      onView={() => open({ title: "Opponent Championship Performance", description: oppPressure.championship_performance, timestamps: [], sectionLabel: "OPPONENT TENDENCIES", badge: "Championship performance", badgeBg: "rgba(211,160,255,0.17)", badgeBorder: "#ac4eff", badgeColor: "#ac4eff" })}
                    />
                  )}
                </div>
              </TimelineSection>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full overflow-auto">
      <div className="flex flex-col gap-8 px-4 pt-[18px] pb-[141px]">
        {/* Headline */}
        <Headline>
          You performed better when trailing but struggled to maintain pressure when leading, which allowed your opponent back into the match during key phases.
        </Headline>

        {/* Timeline */}
        <div className="flex flex-col items-start w-full">
          {/* 1. SHOT CHOICE ISSUES */}
          <TimelineSection label="SHOT CHOICE ISSUES">
            <div className="flex flex-col gap-3 w-full">
              <NarrativeText>
                shot choice coaching insight
              </NarrativeText>
              <ShotComparisonCard
                zoneBadge={{ text: "Rear backhand corner", bg: "#f8f8f8", border: "#929edd", color: "#071f97" }}
                title="Backhand clear when overhead clear available"
                shotPlayed="Backhand clear" shotCount="5x" shotEff="26%" shotEffColor="#eb3030"
                betterOption="Overhead clear" betterEff="51%" betterEffColor="#27e72e"
                diffLabel="24.3% more effective shot"
                buttonLabel="View Backhand Clear"
                onView={() => open({ title: "Backhand Clear", subtitle: "26% Eff.", description: "Backhand clear when overhead clear was available", timestamps: TS, sectionLabel: "SHOT CHOICE ISSUES", shotEff: "26%", shotEffColor: "#eb3030", betterOption: "Overhead clear", betterEff: "51%", betterEffColor: "#27e72e", diffLabel: "24.3% more effective shot", badge: "Rear backhand corner", badgeBg: "#f8f8f8", badgeBorder: "#929edd", badgeColor: "#071f97" })}
              />
              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              <ShotComparisonCard
                zoneBadge={{ text: "Front Court", bg: "#fff6fe", border: "#d7b6d4", color: "#97078b" }}
                title="Passive lifts/clears when net play available"
                shotPlayed="Passive lifts/clears" shotCount="99x" shotEff="36.7%" shotEffColor="#eb3030"
                betterOption="Net play" betterEff="62%" betterEffColor="#27e72e"
                diffLabel="25.4% more effective shot"
                buttonLabel="View Passive lifts/clears"
                onView={() => open({ title: "Passive Lifts/Clears", subtitle: "36.7% Eff.", description: "Passive lifts/clears when net play was available", timestamps: TS, sectionLabel: "SHOT CHOICE ISSUES", shotEff: "36.7%", shotEffColor: "#eb3030", betterOption: "Net play", betterEff: "62%", betterEffColor: "#27e72e", diffLabel: "25.4% more effective shot", badge: "Front Court", badgeBg: "#fff6fe", badgeBorder: "#d7b6d4", badgeColor: "#97078b" })}
              />
            </div>
          </TimelineSection>

          {/* 2. RALLY BLUEPRINT */}
          <TimelineSection label="RALLY BLUEPRINT">
            <div className="flex flex-col gap-3 w-full">
              <NarrativeText>
                Rally blueprint insight
              </NarrativeText>
              <BlueprintCard
                badges={[
                  { text: "Short Rallies", bg: "#fff6fe", border: "#d7b6d4", color: "#97078b" },
                  { text: "Balanced", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" },
                ]}
                title="Opponent balanced approach in long rallies"
                description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                buttonLabel="View Evidence"
                onView={() => open({ title: "Short Rally Blueprint", subtitle: "Balanced", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Short Rallies", bg: "#fff6fe", border: "#d7b6d4", color: "#97078b" }, { text: "Balanced", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" }] })}
              />
              <BlueprintCard
                badges={[
                  { text: "Medium Rallies", bg: "#f6fcff", border: "#9dcbe3", color: "#3998c8" },
                  { text: "Attack", bg: "rgba(235,62,68,0.19)", border: "#f6bdd8", color: "#97071f" },
                ]}
                title="Opponent balanced approach in long rallies"
                description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                buttonLabel="View Evidence"
                onView={() => open({ title: "Medium Rally Blueprint", subtitle: "Attack", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Medium Rallies", bg: "#f6fcff", border: "#9dcbe3", color: "#3998c8" }, { text: "Attack", bg: "rgba(235,62,68,0.19)", border: "#f6bdd8", color: "#97071f" }] })}
              />
              <BlueprintCard
                badges={[
                  { text: "Long Rallies", bg: "#f0ecff", border: "#cec8eb", color: "#5539c8" },
                  { text: "Defensive", bg: "rgba(166,221,239,0.19)", border: "#dbecfe", color: "#2597cc" },
                ]}
                title="Opponent balanced approach in long rallies"
                description="Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks."
                buttonLabel="View Evidence"
                onView={() => open({ title: "Long Rally Blueprint", subtitle: "Defensive", description: "Your opponent was prone to unforced errors early in the game and after the mid-game interval, which created your scoring streaks.", timestamps: TS.slice(0,3), sectionLabel: "RALLY BLUEPRINT", badges: [{ text: "Long Rallies", bg: "#f0ecff", border: "#cec8eb", color: "#5539c8" }, { text: "Defensive", bg: "rgba(166,221,239,0.19)", border: "#dbecfe", color: "#2597cc" }] })}
              />
            </div>
          </TimelineSection>

          {/* 3. OUTCOME PROXIMITY */}
          <TimelineSection label="OUTCOME PROXIMITY">
            <div className="flex flex-col gap-3 w-full">
              <NarrativeText>
                outcome proximity insight
              </NarrativeText>
              <TippingPointCard
                badge={{ text: "Positive tipping point", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" }}
                shotName="BH Lift Cross" count="7x"
                description="our backhand netkeep becomes a weapon in pressure situations, with effectiveness jumping from 62% to 91%. In tight moments like at 14-13, you execute it with precision to control the net; in neutral phases, it is less decisive."
                buttonLabel="View BH Lift Cross"
                onView={() => open({ title: "BH Lift Cross", subtitle: "Positive", description: "our backhand netkeep becomes a weapon in pressure situations, with effectiveness jumping from 62% to 91%.", timestamps: TS, sectionLabel: "OUTCOME PROXIMITY", count: "7x", badge: "Positive tipping point", badgeBg: "rgba(117,235,62,0.19)", badgeBorder: "#bdf6c0", badgeColor: "#359707" })}
              />
              <TippingPointCard
                badge={{ text: "Positive tipping point", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" }}
                shotName="FH Lift Cross" count="5x"
                description="our backhand netkeep becomes a weapon in pressure situations, with effectiveness jumping from 62% to 91%. In tight moments like at 14-13, you execute it with precision to control the net; in neutral phases, it is less decisive."
                buttonLabel="View FH Lift Cross"
                onView={() => open({ title: "FH Lift Cross", subtitle: "Positive", description: "our backhand netkeep becomes a weapon in pressure situations, with effectiveness jumping from 62% to 91%.", timestamps: TS.slice(0,4), sectionLabel: "OUTCOME PROXIMITY", count: "5x", badge: "Positive tipping point", badgeBg: "rgba(117,235,62,0.19)", badgeBorder: "#bdf6c0", badgeColor: "#359707" })}
              />
              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              <TippingPointCard
                badge={{ text: "Negative tipping point", bg: "rgba(255,78,100,0.17)", border: "#ff4e64", color: "#ff4e64" }}
                shotName="BH Defense Cross" count="6x"
                description="Your flat game exchanges break down under pressure, dropping from 100% effectiveness to just 45%. While reliable in neutral rallies, this shot became a source of errors in critical moments like at 18-17, likely due to rushed pace."
                buttonLabel="View BH Defense Cross"
                onView={() => open({ title: "BH Defense Cross", subtitle: "Negative", description: "Your flat game exchanges break down under pressure, dropping from 100% effectiveness to just 45%.", timestamps: TS, sectionLabel: "OUTCOME PROXIMITY", count: "6x", badge: "Negative tipping point", badgeBg: "rgba(255,78,100,0.17)", badgeBorder: "#ff4e64", badgeColor: "#ff4e64" })}
              />
            </div>
          </TimelineSection>

          {/* 4. POST SHOT RECOVERY */}
          <TimelineSection label="POST SHOT RECOVERY">
            <div className="flex flex-col gap-3 w-full">
              <NarrativeText>
                narrative: recovery insight
              </NarrativeText>
              <TippingPointCard
                badge={{ text: "Faster", bg: "rgba(117,235,62,0.19)", border: "#bdf6c0", color: "#359707" }}
                shotName="Clear" count="48x"
                description="After clears, you recover 10.0% faster and are 3.6% less effective."
                buttonLabel="View Clears"
                onView={() => open({ title: "Clear Recovery", subtitle: "Faster", description: "After clears, you recover 10.0% faster and are 3.6% less effective.", timestamps: TS, sectionLabel: "POST SHOT RECOVERY", count: "48x", badge: "Faster", badgeBg: "rgba(117,235,62,0.19)", badgeBorder: "#bdf6c0", badgeColor: "#359707" })}
              />
              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              <TippingPointCard
                badge={{ text: "Slow", bg: "rgba(255,78,100,0.17)", border: "#ff4e64", color: "#ff4e64" }}
                shotName="Drop" count="6x"
                description="After drops, you recover 24.0% slower and are 3.9% less effective."
                buttonLabel="View Drops"
                onView={() => open({ title: "Drop Recovery", subtitle: "Slow", description: "After drops, you recover 24.0% slower and are 3.9% less effective.", timestamps: TS.slice(0,3), sectionLabel: "POST SHOT RECOVERY", count: "6x", badge: "Slow", badgeBg: "rgba(255,78,100,0.17)", badgeBorder: "#ff4e64", badgeColor: "#ff4e64" })}
              />
            </div>
          </TimelineSection>

          {/* 5. ADAPTIVE PERFORMANCE */}
          <TimelineSection label="ADAPTIVE PERFORMANCE" isLast>
            <div className="flex flex-col gap-3 w-full">
              <NarrativeText>
                Effectiveness peaks in Endgame (63.2) and drops in Pre Interval (46.9)
              </NarrativeText>
              <TippingPointCard
                badge={{ text: "Championship performance", bg: "rgba(211,160,255,0.17)", border: "#ac4eff", color: "#ac4eff" }}
                shotName="Clear" count="48x"
                description="After clears, you recover 10.0% faster and are 3.6% less effective."
                buttonLabel="View Clears"
                onView={() => open({ title: "Championship Clear", subtitle: "48x", description: "After clears, you recover 10.0% faster and are 3.6% less effective.", timestamps: TS, sectionLabel: "ADAPTIVE PERFORMANCE", count: "48x", badge: "Championship performance", badgeBg: "rgba(211,160,255,0.17)", badgeBorder: "#ac4eff", badgeColor: "#ac4eff" })}
              />
              <div className="h-px w-full bg-[var(--grey-900,#efece6)]" />
              <NarrativeText>
                A 16 point effectiveness gap between scoring phases suggests inconsistency under different game situations.
              </NarrativeText>
            </div>
          </TimelineSection>
        </div>
      </div>
    </div>
  );
}
