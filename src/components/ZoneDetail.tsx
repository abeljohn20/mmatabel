"use client";

import type { Zone } from "@/lib/types";
import { formatStroke, effColor, classificationStyle, classificationLabel } from "@/lib/utils";

interface ZoneDetailProps {
  zoneId: string;
  zone: Zone;
  classifications?: Record<string, string>;
}

const ZONE_LABELS: Record<string, string> = {
  "1a": "Front Left", "2a": "Front Right",
  "3a": "Middle Left", "4a": "Middle Right",
  "5a": "Back Left", "6a": "Back Right",
  "1b": "Front Left", "2b": "Front Right",
  "3b": "Middle Left", "4b": "Middle Right",
  "5b": "Back Left", "6b": "Back Right",
};

export function ZoneDetail({ zoneId, zone, classifications }: ZoneDetailProps) {
  const shots = Object.entries(zone.shot_distribution)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => (b.count || b.n || 0) - (a.count || a.n || 0));

  return (
    <div className="bg-[var(--bg-elv-2)] rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-light text-[var(--text-subtext)]">Zone</span>
          <h3 className="text-base font-semibold text-[var(--grey-250)]">
            {ZONE_LABELS[zoneId] || zoneId}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-light text-[var(--text-subtext)]">Avg. Effectiveness</span>
          <p className="text-base font-semibold text-[var(--grey-250)]">
            {zone.total_shots} shots
          </p>
        </div>
      </div>

      {/* Shot pills */}
      <div className="flex flex-wrap gap-2">
        {shots.map((shot) => {
          const cls = classifications?.[shot.name] || "";
          const style = classificationStyle(cls);
          return (
            <div
              key={shot.name}
              className="rounded-md px-3 py-1.5 text-xs font-normal"
              style={{ backgroundColor: style.bg, color: style.text }}
            >
              {formatStroke(shot.name)}
            </div>
          );
        })}
      </div>

      {/* Shot detail rows */}
      <div className="space-y-2">
        {shots.map((shot) => {
          const count = shot.count || shot.n || 0;
          const eff = shot.avg_eff || 0;
          const cls = classifications?.[shot.name] || "";

          return (
            <div key={shot.name} className="bg-white rounded-lg p-3 border border-[var(--grey-850)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--grey-250)]">
                    {formatStroke(shot.name)}
                  </span>
                  {cls && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: classificationStyle(cls).bg,
                        color: classificationStyle(cls).text,
                      }}
                    >
                      {classificationLabel(cls)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[var(--text-subtext)]">
                  {count}x ({shot.pct?.toFixed(0) || "—"}%)
                </span>
              </div>

              {/* Effectiveness bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, eff)}%`,
                      backgroundColor: eff >= 65 ? "var(--success)" : eff >= 45 ? "var(--neutral-bar)" : "var(--danger)",
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold tabular-nums ${effColor(eff)}`}>
                  {eff.toFixed(0)}%
                </span>
              </div>

              {/* Landings */}
              {shot.landings && Object.keys(shot.landings).length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--grey-850)]">
                  <span className="text-[10px] text-[var(--text-subtext)] uppercase tracking-wide">
                    Landing zones
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(shot.landings).map(([landZone, data]) => (
                      <span
                        key={landZone}
                        className={`text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elv-1)] ${effColor(data.avg_eff)}`}
                      >
                        {landZone}: {data.count}x @ {data.avg_eff.toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
