"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ─── Types ─── */

export interface VideoSheetData {
  title: string;
  subtitle?: string;
  description?: string;
  timestamps: number[];
  sectionLabel?: string;
}

interface VideoSheetProps extends VideoSheetData {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

/* ─── Transport button ─── */

function TransportButton({
  children,
  onClick,
  label,
  size = 40,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: "rgba(43,42,42,0.5)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white",
        fontSize: 16,
      }}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */

export function VideoSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  videoSrc,
  timestamps,
  sectionLabel,
}: VideoSheetProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen, title]);

  const seekTo = useCallback(
    (index: number) => {
      if (videoRef.current && timestamps[index] != null) {
        videoRef.current.currentTime = timestamps[index];
      }
    },
    [timestamps]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.max(0, i - 1);
      if (videoRef.current && timestamps[next] != null)
        videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(timestamps.length - 1, i + 1);
      if (videoRef.current && timestamps[next] != null)
        videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, []);

  if (!rendered) return null;

  const subtitleColor = (() => {
    if (!subtitle) return "#888";
    const num = parseFloat(subtitle);
    if (isNaN(num)) return "#888";
    if (num >= 60) return "#2dbd1a";
    if (num >= 45) return "#f59e0b";
    return "#ff4e64";
  })();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(0,0,0,0.5)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: visible ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Container: close button + sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents: "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} video`}
      >
        {/* ─── Floating close button (above the sheet) ─── */}
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 99999,
            background: "rgba(255,255,255,0.56)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            pointerEvents: "auto",
          }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="5" x2="15" y2="15" />
            <line x1="15" y1="5" x2="5" y2="15" />
          </svg>
        </button>

        {/* ─── Sheet ─── */}
        <div
          style={{
            background: "var(--bg-elv-1, #fafafa)",
            borderRadius: "20px 20px 0 0",
            width: "100%",
            minHeight: "60dvh",
            maxHeight: "85dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
          }}
        >
          {/* ─── Section label header ─── */}
          <div
            style={{
              padding: "16px 16px 0",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {sectionLabel && (
              <>
                <Image src="/icons/timeline-orange.svg" alt="" width={24} height={24} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--grey-450, #6b6760)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {sectionLabel}
                </span>
              </>
            )}
            <div style={{ flex: 1, height: 1, background: "var(--brand-orange, #fa642d)" }} />
          </div>

          {/* ─── Scrollable content ─── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* ─── Video player ─── */}
            <div
              style={{
                background: "#363636",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "16/9",
                margin: "12px 0 0",
              }}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onLoadedMetadata={() => seekTo(0)}
              />

              {/* Transport controls */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  transform: "translateY(-60%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                }}
              >
                <TransportButton onClick={handlePrev} label="Previous instance" size={36}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
                    <rect x="2" y="3" width="2" height="10" />
                    <path d="M14 3L6 8l8 5V3z" />
                  </svg>
                </TransportButton>
                <TransportButton onClick={handlePlayPause} label="Play or pause" size={48}>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
                    <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
                    <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
                  </svg>
                </TransportButton>
                <TransportButton onClick={handleNext} label="Next instance" size={36}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
                    <rect x="12" y="3" width="2" height="10" />
                    <path d="M2 3l8 5-8 5V3z" />
                  </svg>
                </TransportButton>
              </div>

              {/* Timeline bar with instance ticks */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(214,214,214,0.58)",
                    borderRadius: 20,
                    position: "relative",
                  }}
                >
                  {/* Progress fill */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: 4,
                      width: `${((timestamps[currentIndex] || 0) / (videoRef.current?.duration || 2377)) * 100}%`,
                      background: "white",
                      borderRadius: 20,
                    }}
                  />
                </div>
              </div>

              {/* Instance tick marks */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 12,
                  right: 12,
                  height: 24,
                }}
              >
                {timestamps.map((ts, i) => {
                  const duration = videoRef.current?.duration || 2377;
                  const pos = (ts / duration) * 100;
                  const isActive = i === currentIndex;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        seekTo(i);
                      }}
                      style={{
                        position: "absolute",
                        left: `${pos}%`,
                        bottom: 5,
                        width: 4,
                        height: 14,
                        background: isActive ? "#ec5e26" : "white",
                        borderRadius: 15,
                        transform: "translateX(-2px)",
                        cursor: "pointer",
                        zIndex: isActive ? 2 : 1,
                      }}
                    />
                  );
                })}
              </div>

              {/* Shot counter */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 12,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(0,0,0,0.4)",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {currentIndex + 1}/{timestamps.length}
              </div>
            </div>

            {/* ─── Title + eff row ─── */}
            <div style={{ padding: "20px 16px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-heading, #161616)",
                    letterSpacing: "-1px",
                    lineHeight: 1.2,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {title}
                </span>
                {subtitle && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: subtitleColor,
                      letterSpacing: "-0.4px",
                      lineHeight: 1.32,
                      flexShrink: 0,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {subtitle}
                  </span>
                )}
              </div>

              {description && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: "var(--text-subtext, #6d6d6d)",
                    marginTop: 4,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
