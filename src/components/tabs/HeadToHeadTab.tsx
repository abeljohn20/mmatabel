import type { MatchReport, Narrative } from "@/lib/types";

interface Props {
  report: MatchReport;
  narrative: Narrative;
  analysisView?: "your" | "opponent";
}

export function HeadToHeadTab({ report, narrative, analysisView = "your" }: Props) {
  const h2h = report.deep_match_report.match_dynamics.head_to_head;
  const narr = narrative.section_narratives.head_to_head;
  const isOpponent = analysisView === "opponent";
  const wed = h2h.winner_error_difference;
  const rla = h2h.rally_length_advantage;

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-2xl font-medium text-[var(--text-heading)] tracking-[-1px] leading-[1.2]">
        {isOpponent ? "Head to Head (Opponent View)" : (narr.h2h_headline || "Head to Head")}
      </h2>

      {/* Winner/Error Balance */}
      <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--grey-250)]">Winners vs Errors</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-[var(--grey-850)] text-center">
            <span className="text-xs text-[var(--text-subtext)]">{isOpponent ? "Opponent" : "You"}</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <div>
                <span className="text-lg font-semibold text-[var(--success)]">
                  {isOpponent ? wed.opponent_winners : wed.player_winners}
                </span>
                <p className="text-[10px] text-[var(--text-subtext)]">Winners</p>
              </div>
              <div>
                <span className="text-lg font-semibold text-[var(--danger)]">
                  {isOpponent ? wed.opponent_ue : wed.player_ue}
                </span>
                <p className="text-[10px] text-[var(--text-subtext)]">UE</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[var(--grey-850)] text-center">
            <span className="text-xs text-[var(--text-subtext)]">{isOpponent ? "You" : "Opponent"}</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <div>
                <span className="text-lg font-semibold text-[var(--success)]">
                  {isOpponent ? wed.player_winners : wed.opponent_winners}
                </span>
                <p className="text-[10px] text-[var(--text-subtext)]">Winners</p>
              </div>
              <div>
                <span className="text-lg font-semibold text-[var(--danger)]">
                  {isOpponent ? wed.player_ue : wed.opponent_ue}
                </span>
                <p className="text-[10px] text-[var(--text-subtext)]">UE</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <span className={`text-sm font-semibold ${(isOpponent ? -wed.delta : wed.delta) >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {(isOpponent ? -wed.delta : wed.delta) >= 0 ? "+" : ""}{isOpponent ? -wed.delta : wed.delta} net W/E
          </span>
        </div>
        {narr.winner_error_insight && (
          <p className="text-xs text-[var(--grey-400)] leading-relaxed">{narr.winner_error_insight}</p>
        )}
      </div>

      {/* Rally Length Advantage */}
      {rla && (
        <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--grey-250)]">Rally Length Advantage</h3>
          {Object.entries(rla).map(([length, data]) => {
            const pwr = isOpponent ? (1 - data.player_win_rate) : data.player_win_rate;
            return (
              <div key={length} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--grey-400)] capitalize">{length}</span>
                  <span className={pwr >= 0.55 ? "text-[var(--success)] font-medium" : pwr <= 0.45 ? "text-[var(--danger)] font-medium" : "text-[var(--grey-400)]"}>
                    {(pwr * 100).toFixed(0)}% win rate
                  </span>
                </div>
                <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pwr * 100}%`,
                      backgroundColor: pwr >= 0.55 ? "var(--success)" : pwr >= 0.45 ? "var(--warning)" : "var(--danger)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {narr.rally_length_comparison && (
            <div className="space-y-1 pt-1">
              {typeof narr.rally_length_comparison === "object" &&
                Object.entries(narr.rally_length_comparison as Record<string, string>).map(([k, v]) => (
                  v && <p key={k} className="text-xs text-[var(--grey-400)]"><span className="font-medium capitalize">{k}:</span> {v}</p>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Style Comparison */}
      {h2h.style_comparison && (
        <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-xs text-[var(--text-subtext)]">
              {isOpponent ? "Opponent Style" : "Your Style"}
            </span>
            <p className="text-sm font-semibold text-[var(--grey-250)] capitalize mt-0.5">
              {isOpponent ? h2h.style_comparison.opponent_style : h2h.style_comparison.player_style}
            </p>
          </div>
          <div className="w-px h-8 bg-[var(--grey-800)]" />
          <div className="text-center flex-1">
            <span className="text-xs text-[var(--text-subtext)]">
              {isOpponent ? "Your Style" : "Opponent Style"}
            </span>
            <p className="text-sm font-semibold text-[var(--grey-250)] capitalize mt-0.5">
              {isOpponent ? h2h.style_comparison.player_style : h2h.style_comparison.opponent_style}
            </p>
          </div>
        </div>
      )}

      {/* Category comparison */}
      {h2h.by_category && h2h.by_category.length > 0 && (
        <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-[var(--grey-250)]">Category Comparison</h3>
          {h2h.by_category.map((c: { category: string; player_eff: number; opponent_eff: number; gap: number }, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[var(--grey-400)] capitalize">{c.category?.replace(/_/g, " ")}</span>
              <div className="flex gap-3">
                <span className={(isOpponent ? -c.gap : c.gap) >= 0 ? "text-[var(--success)] font-medium" : "text-[var(--danger)] font-medium"}>
                  {isOpponent ? "Opp" : "You"}: {isOpponent ? c.opponent_eff?.toFixed(0) : c.player_eff?.toFixed(0)}%
                </span>
                <span className="text-[var(--text-subtext)]">
                  {isOpponent ? "You" : "Opp"}: {isOpponent ? c.player_eff?.toFixed(0) : c.opponent_eff?.toFixed(0)}%
                </span>
                <span className={(isOpponent ? -c.gap : c.gap) >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {(isOpponent ? -c.gap : c.gap) >= 0 ? "+" : ""}{(isOpponent ? -c.gap : c.gap)?.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Narrative */}
      {narr.category_comparison_insight && (
        <p className="text-xs text-[var(--grey-400)] leading-relaxed">{narr.category_comparison_insight}</p>
      )}
      {narr.style_comparison_insight && (
        <p className="text-xs text-[var(--grey-400)] leading-relaxed">{narr.style_comparison_insight}</p>
      )}
    </div>
  );
}
