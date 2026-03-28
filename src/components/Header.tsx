"use client";

import { matches } from "@/lib/matches";

interface HeaderProps {
  matchId: string;
  matchIdx: number;
  onChangeMatch: (idx: number) => void;
}

export function Header({ matchId, matchIdx, onChangeMatch }: HeaderProps) {
  return (
    <div className="bg-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs text-[var(--text-heading)]">Back</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={matchIdx}
          onChange={(e) => onChangeMatch(Number(e.target.value))}
          className="text-xs font-light text-[var(--text-subtext)] bg-transparent border-none outline-none cursor-pointer"
        >
          {matches.map((m, i) => (
            <option key={m.report.match_id} value={i}>
              {m.report.match_id}
            </option>
          ))}
        </select>
        <span className="w-1 h-1 rounded-full bg-[var(--text-subtext)]" />
        <span className="text-xs font-light text-[var(--text-subtext)]">
          {matchId}
        </span>
      </div>
    </div>
  );
}
