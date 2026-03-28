import type { Shot } from "@/lib/types";
import { formatStroke, effColor, classificationStyle, classificationLabel } from "@/lib/utils";

interface ShotCardProps {
  shot: Shot;
}

export function ShotCard({ shot }: ShotCardProps) {
  const eff = shot.effectiveness?.avg ?? shot.avg_eff ?? 0;
  const n = shot.volume?.n ?? shot.n ?? 0;
  const cls = shot.classification;
  const style = classificationStyle(cls);

  return (
    <div className="bg-white rounded-lg border border-[var(--grey-850)] p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-[var(--grey-250)]">
            {formatStroke(shot.stroke)}
          </h4>
          {shot.category && (
            <span className="text-[10px] text-[var(--text-subtext)]">
              {formatStroke(shot.category)}
            </span>
          )}
        </div>
        <span
          className="text-[10px] font-normal px-2 py-0.5 rounded"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {classificationLabel(cls)}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-semibold tracking-[-1px] ${effColor(eff)}`}>
              {eff.toFixed(0)}%
            </span>
            <span className="text-[10px] text-[var(--text-subtext)]">Avg. Effectiveness</span>
          </div>
          {/* Effectiveness bar */}
          <div className="mt-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, eff)}%`,
                backgroundColor: eff >= 65 ? "var(--success)" : eff >= 45 ? "var(--neutral-bar)" : "var(--danger)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Distribution badges */}
      {shot.effectiveness?.distribution && (
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(shot.effectiveness.distribution).map(([level, pct]) => {
            if (!pct) return null;
            const colors: Record<string, string> = {
              elite: "var(--success)",
              good: "#3b82f6",
              average: "var(--warning)",
              weak: "var(--danger)",
            };
            return (
              <span
                key={level}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${colors[level] || "#999"}15`,
                  color: colors[level] || "#999",
                }}
              >
                {level}: {(pct * 100).toFixed(0)}%
              </span>
            );
          })}
        </div>
      )}

      {/* Bottom stats */}
      <div className="flex items-center gap-3 text-[10px] text-[var(--text-subtext)] pt-1 border-t border-[var(--grey-850)]">
        <span>{n} shots</span>
        {shot.winners != null && (
          <span className="text-[var(--success)]">{shot.winners}W</span>
        )}
        {shot.unforced_errors != null && (
          <span className="text-[var(--danger)]">{shot.unforced_errors}UE</span>
        )}
        {shot.win_rate != null && (
          <span>WR: {(shot.win_rate * 100).toFixed(0)}%</span>
        )}
        {shot.pressure && (
          <span className={shot.pressure.delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
            P: {shot.pressure.delta >= 0 ? "+" : ""}{shot.pressure.delta.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
