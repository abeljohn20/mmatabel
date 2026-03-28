"use client";

import type { ZoneDistribution, Zone } from "@/lib/types";

interface CourtZoneMapProps {
  zoneDistribution: ZoneDistribution;
  side: "player" | "opponent";
  onZoneSelect: (zoneId: string, zone: Zone) => void;
  selectedZone: string | null;
}

const PLAYER_ZONES = [
  ["1a", "2a"],
  ["3a", "4a"],
  ["5a", "6a"],
];

const OPPONENT_ZONES = [
  ["1b", "2b"],
  ["3b", "4b"],
  ["5b", "6b"],
];

const ZONE_LABELS: Record<string, string> = {
  "1a": "Front left", "2a": "Front right",
  "3a": "Mid left", "4a": "Mid right",
  "5a": "Back left", "6a": "Back right",
  "1b": "Front left", "2b": "Front right",
  "3b": "Mid left", "4b": "Mid right",
  "5b": "Back left", "6b": "Back right",
};

function getZoneEff(zone: Zone): number {
  if (!zone || !zone.shot_distribution) return 0;
  const shots = Object.values(zone.shot_distribution);
  if (shots.length === 0) return 0;
  const totalCount = shots.reduce((s, sh) => s + (sh.count || sh.n || 0), 0);
  if (totalCount === 0) return 0;
  const weighted = shots.reduce((s, sh) => s + (sh.avg_eff || 0) * (sh.count || sh.n || 0), 0);
  return weighted / totalCount;
}

function zoneStyle(eff: number, isSelected: boolean) {
  if (eff >= 65) {
    return {
      bg: isSelected ? "rgba(55,216,37,0.45)" : "rgba(55,216,37,0.3)",
      border: "#1b9f2a",
      text: "white",
      labelText: "#f7f5f0",
    };
  }
  if (eff >= 45) {
    return {
      bg: isSelected ? "rgba(243,243,243,0.45)" : "rgba(243,243,243,0.3)",
      border: "#7a7a7a",
      text: "#252424",
      labelText: "#3e3a32",
    };
  }
  return {
    bg: isSelected ? "rgba(222,73,73,0.55)" : "rgba(222,73,73,0.45)",
    border: "#f71b1b",
    text: "#fffefe",
    labelText: "white",
  };
}

export function CourtZoneMap({ zoneDistribution, side, onZoneSelect, selectedZone }: CourtZoneMapProps) {
  const zones = zoneDistribution.zones;
  const layout = side === "player" ? PLAYER_ZONES : OPPONENT_ZONES;

  return (
    <div className="bg-[var(--bg-elv-2)] rounded-xl p-3 space-y-3">
      {/* Court container */}
      <div className="relative overflow-hidden rounded-lg shadow-[0px_9px_9.1px_0px_rgba(139,139,139,0.25)] border border-[var(--grey-850)]">
        {/* Green court background */}
        <div className="bg-[#c1deba] relative" style={{ height: 420 }}>
          {/* Court boundary lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 326 692"
            preserveAspectRatio="none"
            style={{ top: -271 }}
            height={692}
          >
            {/* Outer boundary */}
            <rect x="14" y="14" width="298" height="664" fill="none" stroke="#fefefe" strokeWidth="1" />
            {/* Top service box */}
            <rect x="14" y="14" width="298" height="17" fill="none" stroke="#fefefe" strokeWidth="1" />
            {/* Bottom service box */}
            <rect x="14" y="661" width="298" height="16" fill="none" stroke="#fefefe" strokeWidth="1" />
            {/* Center vertical line */}
            <line x1="163" y1="14" x2="163" y2="346" stroke="#fefefe" strokeWidth="1" />
            <line x1="163" y1="346" x2="163" y2="678" stroke="#fefefe" strokeWidth="1" />
            {/* Service lines - short */}
            <line x1="14" y1="300" x2="163" y2="300" stroke="#fefefe" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="163" y1="300" x2="312" y2="300" stroke="#fefefe" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="14" y1="391" x2="163" y2="391" stroke="#fefefe" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="163" y1="391" x2="312" y2="391" stroke="#fefefe" strokeWidth="1" strokeDasharray="4 3" />
            {/* Long service lines */}
            <line x1="30" y1="14" x2="30" y2="678" stroke="#fefefe" strokeWidth="1" />
            <line x1="296" y1="14" x2="296" y2="678" stroke="#fefefe" strokeWidth="1" />
          </svg>

          {/* Net line in the middle */}
          <div
            className="absolute left-0 right-0 flex items-center gap-3 px-5 z-10 bg-white/90"
            style={{ top: "calc(50% - 10px)", height: 20 }}
          >
            <div className="flex-1 h-px bg-[var(--grey-750)]" />
            <span className="text-xs font-light text-[var(--text-subtext)]">Net</span>
            <div className="flex-1 h-px bg-[var(--grey-750)]" />
          </div>

          {/* Zone overlays — player side (bottom half) */}
          <div
            className="absolute left-[14px] right-[14px] bottom-[0px] flex flex-col"
            style={{ top: "calc(50% + 10px)" }}
          >
            {layout.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-1 min-h-0">
                {row.map((zoneId) => {
                  const zone = zones[zoneId];
                  const eff = zone ? getZoneEff(zone) : 0;
                  const isSelected = selectedZone === zoneId;
                  const style = zoneStyle(eff, isSelected);

                  return (
                    <button
                      key={zoneId}
                      onClick={() => zone && onZoneSelect(zoneId, zone)}
                      className="flex-1 flex flex-col items-center justify-center gap-[5px] m-[6px] rounded-lg border border-dashed transition-all"
                      style={{
                        backgroundColor: zone ? style.bg : "transparent",
                        borderColor: zone ? style.border : "transparent",
                      }}
                    >
                      <span
                        className="text-xs font-light leading-[1.6]"
                        style={{ color: zone ? style.labelText : "transparent" }}
                      >
                        {ZONE_LABELS[zoneId]}
                      </span>
                      <div className="flex flex-col items-center" style={{ color: zone ? style.text : "transparent" }}>
                        <span className="text-xl font-bold tracking-[-1px] leading-[1.2]">
                          {eff > 0 ? `${Math.round(eff)}%` : "—"}
                        </span>
                        <span className="text-xs font-light leading-[1.6]">
                          Effectiveness
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--grey-550)] text-center">
        Select a zone to understand your shot distribution
      </p>
    </div>
  );
}
