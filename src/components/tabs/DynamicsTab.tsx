import type { MatchReport, Narrative } from "@/lib/types";
import type { VideoSheetData } from "@/components/VideoSheet";
import { formatStroke, effColor } from "@/lib/utils";
import { ViewButton } from "@/components/ViewButton";

const TURNING_POINT_TIMESTAMPS = [5354 / 30, 19694 / 30, 32725 / 30, 64415 / 30];

interface Props {
  report: MatchReport;
  narrative: Narrative;
  analysisView?: "your" | "opponent";
  onOpenVideo?: (data: VideoSheetData) => void;
}

export function DynamicsTab({ report, narrative, analysisView = "your", onOpenVideo }: Props) {
  const md = report.deep_match_report.match_dynamics;
  const narr = narrative.section_narratives.pressure_dynamics;
  const isOpponent = analysisView === "opponent";
  const pp = md.pressure_profile;
  const ge = md.game_evolution;

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-2xl font-medium text-[var(--text-heading)] tracking-[-1px] leading-[1.2]">
        {isOpponent ? "Opponent Match Dynamics" : (narr.dynamics_headline || "Match Dynamics")}
      </h2>

      {/* Championship Phase */}
      <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--grey-250)]">Pressure Performance</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-lg p-3 border border-[var(--grey-850)] text-center">
            <span className={`text-xl font-semibold tracking-[-1px] ${effColor(pp.championship_phase.avg_eff)}`}>
              {pp.championship_phase.avg_eff.toFixed(1)}%
            </span>
            <p className="text-[10px] text-[var(--text-subtext)] mt-0.5">Under Pressure</p>
          </div>
          <div className="flex-1 bg-white rounded-lg p-3 border border-[var(--grey-850)] text-center">
            <span className="text-xl font-semibold tracking-[-1px] text-[var(--grey-250)]">
              {pp.championship_phase.overall_avg_eff.toFixed(1)}%
            </span>
            <p className="text-[10px] text-[var(--text-subtext)] mt-0.5">Overall</p>
          </div>
          <div className="flex-1 bg-white rounded-lg p-3 border border-[var(--grey-850)] text-center">
            <span className={`text-xl font-semibold tracking-[-1px] ${pp.championship_phase.delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {pp.championship_phase.delta >= 0 ? "+" : ""}{pp.championship_phase.delta.toFixed(1)}
            </span>
            <p className="text-[10px] text-[var(--text-subtext)] mt-0.5">Delta</p>
          </div>
        </div>
      </div>

      {/* Clutch Shots */}
      {pp.clutch_shots.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--success)]">
            {isOpponent ? "Opponent\u2019s Clutch Shots" : "Clutch Shots"}
          </h3>
          {pp.clutch_shots.map((s: any, i: number) => {
            const evidenceFrames = s.evidence?.map((e: any) => e.frame / 30) ?? TURNING_POINT_TIMESTAMPS;
            return (
              <div key={s.shot || s.stroke || i} className="bg-[var(--success-bg)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[var(--grey-250)]">{formatStroke(s.shot || s.stroke)}</span>
                    <p className="text-[10px] text-[var(--text-subtext)]">{s.n_crucial} crucial shots</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--success)]">
                    +{s.delta.toFixed(1)}
                  </span>
                </div>
                {onOpenVideo && (
                  <div className="mt-2">
                    <ViewButton
                      label="View Instances"
                      onClick={() =>
                        onOpenVideo({
                          title: formatStroke(s.shot || s.stroke),
                          subtitle: `+${s.delta.toFixed(1)} delta`,
                          description: `${s.n_crucial} crucial shots under pressure with elevated effectiveness.`,
                          timestamps: evidenceFrames,
                          sectionLabel: "CLUTCH SHOTS",
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fragile Shots */}
      {pp.fragile_shots.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--danger)]">
            {isOpponent ? "Opponent\u2019s Fragile Shots" : "Fragile Shots"}
          </h3>
          {pp.fragile_shots.map((s: any, i: number) => {
            const evidenceFrames = s.evidence?.map((e: any) => e.frame / 30) ?? TURNING_POINT_TIMESTAMPS;
            return (
              <div key={s.shot || s.stroke || i} className="bg-[var(--danger-bg)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[var(--grey-250)]">{formatStroke(s.shot || s.stroke)}</span>
                    <p className="text-[10px] text-[var(--text-subtext)]">{s.n_crucial} crucial shots</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--danger)]">
                    {s.delta.toFixed(1)}
                  </span>
                </div>
                {onOpenVideo && (
                  <div className="mt-2">
                    <ViewButton
                      label="View Instances"
                      onClick={() =>
                        onOpenVideo({
                          title: formatStroke(s.shot || s.stroke),
                          subtitle: `${s.delta.toFixed(1)} delta`,
                          description: `${s.n_crucial} crucial shots where effectiveness dropped under pressure.`,
                          timestamps: evidenceFrames,
                          sectionLabel: "FRAGILE SHOTS",
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Score State */}
      {pp.score_state && (
        <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-[var(--grey-250)]">
            {isOpponent ? "Opponent Score State" : "Score State"}
          </h3>
          {pp.score_state.leading && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--grey-400)]">When Leading</span>
              <span className={`font-medium ${effColor(pp.score_state.leading.avg_eff)}`}>
                {pp.score_state.leading.avg_eff.toFixed(1)}%
              </span>
            </div>
          )}
          {pp.score_state.trailing && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--grey-400)]">When Trailing</span>
              <span className={`font-medium ${effColor(pp.score_state.trailing.avg_eff)}`}>
                {pp.score_state.trailing.avg_eff.toFixed(1)}%
              </span>
            </div>
          )}
          {pp.score_state.equal && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--grey-400)]">When Equal</span>
              <span className={`font-medium ${effColor(pp.score_state.equal.avg_eff)}`}>
                {pp.score_state.equal.avg_eff.toFixed(1)}%
              </span>
            </div>
          )}
          {pp.score_state.insight && (
            <p className="text-[10px] text-[var(--text-subtext)] capitalize pt-1">
              {pp.score_state.insight.replace(/_/g, " ")}
            </p>
          )}
        </div>
      )}

      {/* Game Evolution */}
      {ge.games.length > 0 && (
        <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--grey-250)]">Game Evolution</h3>
            <span className="text-xs text-[var(--text-subtext)] capitalize">Trend: {ge.trend}</span>
          </div>
          {ge.games.map((g) => (
            <div key={g.game} className="bg-white rounded-lg p-3 border border-[var(--grey-850)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--grey-250)]">Game {g.game}</span>
                <span className="text-xs text-[var(--text-subtext)]">{g.rallies} rallies</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <span className={`text-sm font-semibold ${g.win_rate >= 0.5 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                    {(g.win_rate * 100).toFixed(0)}%
                  </span>
                  <p className="text-[10px] text-[var(--text-subtext)]">Win Rate</p>
                </div>
                <div className="flex-1 text-center">
                  <span className={`text-sm font-semibold ${effColor(isOpponent ? (g.opponent_avg_eff ?? g.player_avg_eff) : g.player_avg_eff)}`}>
                    {(isOpponent ? (g.opponent_avg_eff ?? g.player_avg_eff) : g.player_avg_eff).toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-[var(--text-subtext)]">{isOpponent ? "Opp Eff" : "Your Eff"}</p>
                </div>
                {(isOpponent ? true : g.opponent_avg_eff != null) && (
                  <div className="flex-1 text-center">
                    <span className={`text-sm font-semibold ${effColor((isOpponent ? g.player_avg_eff : g.opponent_avg_eff) ?? 0)}`}>
                      {(isOpponent ? g.player_avg_eff : g.opponent_avg_eff)?.toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-[var(--text-subtext)]">{isOpponent ? "Your Eff" : "Opp Eff"}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Narrative insights */}
      {narr.turning_points && narr.turning_points.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--grey-250)]">Turning Points</h3>
          {narr.turning_points.map((tp: { moment: string; insight: string }, i: number) => (
            <div key={i} className="bg-white rounded-lg border border-[var(--grey-850)] p-3">
              <h4 className="text-xs font-semibold text-[var(--brand-orange)] mb-1">{tp.moment}</h4>
              <p className="text-xs text-[var(--grey-400)] leading-relaxed">{tp.insight}</p>
              {onOpenVideo && (
                <div className="mt-2">
                  <ViewButton
                    label="View Moment"
                    onClick={() =>
                      onOpenVideo({
                        title: tp.moment,
                        description: tp.insight,
                        timestamps: [TURNING_POINT_TIMESTAMPS[i] ?? TURNING_POINT_TIMESTAMPS[0]],
                        sectionLabel: "TURNING POINT",
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
