"use client";

import { useRef, useEffect, useCallback, useId } from "react";
import { useActiveCardId, useSetActiveCardId } from "@/lib/ActiveVideoContext";

/**
 * ViewButton — matches the training-report "highlight-tag" button style.
 * On click, sets this button's unique ID as the active card in context.
 * The closest parent [data-card] gets a highlight border.
 */
export function ViewButton({ label, onClick, cardId: externalCardId }: { label: string; onClick?: () => void; cardId?: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const autoId = useId();
  const cardId = externalCardId || autoId;
  const activeCardId = useActiveCardId();
  const setActiveCardId = useSetActiveCardId();
  const isActive = activeCardId === cardId;

  // Highlight the closest [data-card] ancestor
  useEffect(() => {
    if (!btnRef.current) return;
    let el: HTMLElement | null = btnRef.current.parentElement;
    let depth = 0;
    while (el && !el.hasAttribute("data-card") && depth < 8) {
      el = el.parentElement;
      depth++;
    }
    if (el && el.hasAttribute("data-card")) {
      if (isActive) {
        el.setAttribute("data-card-active", "true");
      } else {
        el.removeAttribute("data-card-active");
      }
    }
    return () => {
      if (el && el.hasAttribute("data-card")) {
        el.removeAttribute("data-card-active");
      }
    };
  }, [isActive]);

  const handleClick = useCallback(() => {
    setActiveCardId(cardId);
    onClick?.();
  }, [onClick, cardId, setActiveCardId]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      className="view-button inline-flex p-1 rounded-lg self-start cursor-pointer select-none"
      style={{
        background: "linear-gradient(180deg, #f5f5f5 0%, #ececec 100%)",
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <span
        className="view-button-inner flex items-center justify-center px-2 py-1 rounded overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, #ff5a10 0%, #ff4400 100%)",
          border: "1px solid #fa591f",
          borderRadius: 4,
          boxShadow:
            "0 2px 4px rgba(200,80,20,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span
          className="relative z-10 text-xs font-medium"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            lineHeight: 1.6,
            color: "#ffdd66",
          }}
        >
          {label}
        </span>
      </span>
    </button>
  );
}
