"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TabId } from "@/lib/types";

const tabs: { id: TabId; label: string }[] = [
  { id: "report", label: "Match Report" },
  { id: "arsenal", label: "Shot Arsenal" },
  { id: "opening", label: "Opening Phase" },
  { id: "patterns", label: "Patterns" },
  { id: "dynamics", label: "Dynamics" },
  { id: "h2h", label: "Head To Head" },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  return (
    <div className="bg-white" style={{ position: "relative", zIndex: 100 }}>
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          padding: "12px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              data-tab={tab.id}
              onClick={() => {
                console.log("clicked", tab.id);
                onTabChange(tab.id);
              }}
              style={{
                whiteSpace: "nowrap",
                flexShrink: 0,
                paddingBottom: 6,
                cursor: "pointer",
                fontSize: isActive ? 18 : 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#322e27" : "#908c83",
                letterSpacing: isActive ? "-1px" : "0",
                borderBottom: isActive ? "2px solid #fa642d" : "2px solid transparent",
                WebkitTapHighlightColor: "rgba(0,0,0,0.05)",
                userSelect: "none",
                touchAction: "manipulation",
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
