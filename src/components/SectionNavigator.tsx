"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Section {
  id: string;
  label: string;
}

interface SectionNavigatorProps {
  sections: Section[];
  children: React.ReactNode;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Wraps scrollable content. On long-press (500ms), shows a floating overlay
 * with all section headings. User can drag to a section and release to scroll there.
 * Works across all tabs.
 */
export function SectionNavigator({ sections, children, contentRef }: SectionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const openNav = useCallback(() => {
    setIsOpen(true);
    setActiveIdx(-1);
  }, []);

  const closeNav = useCallback((scrollToIdx: number) => {
    setIsOpen(false);
    setActiveIdx(-1);
    if (scrollToIdx >= 0 && scrollToIdx < sections.length && contentRef.current) {
      const sectionId = sections[scrollToIdx].id;
      const el = contentRef.current.querySelector(`[data-section-id="${sectionId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [sections, contentRef]);

  // Long press detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      openNav();
    }, 500);
  }, [openNav]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long press if finger moves before timer fires
    if (!isOpen && longPressTimer.current) {
      const dy = Math.abs(e.touches[0].clientY - startY.current);
      if (dy > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    // When overlay is open, track which section the finger is over
    if (isOpen && overlayRef.current) {
      const touch = e.touches[0];
      const items = overlayRef.current.querySelectorAll("[data-nav-idx]");
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          setActiveIdx(i);
          break;
        }
      }
    }
  }, [isOpen]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isOpen) {
      closeNav(activeIdx);
    }
  }, [isOpen, activeIdx, closeNav]);

  // Mouse long press (for desktop testing)
  const handleMouseDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      openNav();
    }, 500);
  }, [openNav]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isOpen) {
      closeNav(activeIdx);
    }
  }, [isOpen, activeIdx, closeNav]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isOpen && overlayRef.current) {
      const items = overlayRef.current.querySelectorAll("[data-nav-idx]");
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          setActiveIdx(i);
          break;
        }
      }
    }
  }, [isOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}

      {/* Overlay */}
      {isOpen && (
        <>
          {/* Backdrop blur */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 900,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "opacity 0.2s ease",
            }}
          />

          {/* Section list */}
          <div
            ref={overlayRef}
            style={{
              position: "fixed",
              left: 24,
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 901,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {sections.map((section, i) => (
              <div
                key={section.id}
                data-nav-idx={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: activeIdx === i ? 10 : 0,
                  background: activeIdx === i ? "rgba(250,100,45,0.15)" : "transparent",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {/* Dot/line indicator */}
                <div style={{
                  width: 24,
                  height: 2,
                  borderRadius: 1,
                  background: activeIdx === i ? "#fa642d" : "rgba(255,255,255,0.4)",
                  transition: "background 0.15s ease",
                }} />
                <span
                  style={{
                    fontSize: activeIdx === i ? 16 : 14,
                    fontWeight: activeIdx === i ? 600 : 400,
                    color: activeIdx === i ? "#fa642d" : "rgba(255,255,255,0.8)",
                    letterSpacing: activeIdx === i ? "0.5px" : "0",
                    transition: "all 0.15s ease",
                    textTransform: "uppercase",
                  }}
                >
                  {section.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
