import type { MatchReport, Narrative } from "@/lib/types";

interface Props {
  report: MatchReport;
  narrative: Narrative;
}

export function MatchReportTab({ report, narrative }: Props) {
  const story = narrative.section_narratives.match_story;
  const ctx = report.match_context;

  return (
    <div className="p-4 space-y-6">
      {/* Headline */}
      <h2 className="text-2xl font-medium text-[var(--text-heading)] tracking-[-1px] leading-[1.2]">
        {story.headline}
      </h2>

      {/* Match Context Card */}
      <div className="bg-[var(--bg-elv-2)] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-subtext)]">Result</span>
          <span className={`text-sm font-semibold ${ctx.result === "won" ? "text-[var(--success)]" : ctx.result === "lost" ? "text-[var(--danger)]" : "text-[var(--grey-400)]"}`}>
            {ctx.result === "unknown" ? "—" : ctx.result.toUpperCase()}
          </span>
        </div>
        {ctx.score !== "unknown" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-subtext)]">Score</span>
            <span className="text-sm font-medium text-[var(--text-heading)]">{ctx.score}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-subtext)]">Total Rallies</span>
          <span className="text-sm font-medium text-[var(--text-heading)]">{ctx.total_rallies}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-subtext)]">Games Played</span>
          <span className="text-sm font-medium text-[var(--text-heading)]">{ctx.games_played}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-subtext)]">Avg Effectiveness</span>
          <span className="text-sm font-semibold text-[var(--text-heading)]">{ctx.player_avg_effectiveness.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-subtext)]">Total Shots</span>
          <span className="text-sm font-medium text-[var(--text-heading)]">{ctx.player_total_shots}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[var(--grey-250)]">Match Summary</h3>
        <p className="text-sm leading-relaxed text-[var(--grey-400)]">{story.summary}</p>
      </div>

      {/* Key Differential */}
      {story.key_differential && (
        <div className="bg-[var(--brand-orange)]/8 rounded-xl p-4">
          <h4 className="text-xs font-medium text-[var(--brand-orange)] uppercase tracking-wide mb-1">Key Differential</h4>
          <p className="text-sm text-[var(--grey-250)] leading-relaxed">{story.key_differential}</p>
        </div>
      )}
    </div>
  );
}
