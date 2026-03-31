"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoSheetData, VideoTimelineRange } from "@/components/VideoSheet";

/* ─── Transport button ─── */
function TransportButton({ children, onClick, label, size = 44 }: {
  children: React.ReactNode; onClick?: () => void; label: string; size?: number;
}) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: size, height: size, borderRadius: size / 2,
      background: "rgba(43,42,42,0.5)", border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "white", fontSize: 16,
    }}>
      {children}
    </button>
  );
}

interface Props {
  data: VideoSheetData | null;
  videoSrc: string;
  onClose: () => void;
}

export function DesktopVideoPanel({ data, videoSrc, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const timestamps = data?.timestamps ?? [];
  const streakRanges = data?.streakRanges;
  const hasStreakRanges = streakRanges && streakRanges.length > 0;

  // Reset index when data changes
  useEffect(() => {
    setCurrentIndex(0);
    if (videoRef.current && timestamps.length > 0) {
      videoRef.current.currentTime = timestamps[0];
    }
  }, [data?.title]);

  const seekTo = useCallback((index: number) => {
    if (videoRef.current && timestamps[index] != null) {
      videoRef.current.currentTime = timestamps[index];
    }
  }, [timestamps]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.max(0, i - 1);
      if (videoRef.current && timestamps[next] != null) videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(timestamps.length - 1, i + 1);
      if (videoRef.current && timestamps[next] != null) videoRef.current.currentTime = timestamps[next];
      return next;
    });
  }, [timestamps]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, []);

  const videoDuration = videoRef.current?.duration || 2377;

  const subtitleColor = (() => {
    if (!data?.subtitle) return "#888";
    const num = parseFloat(data.subtitle);
    if (isNaN(num)) return "#888";
    if (num >= 60) return "#2dbd1a";
    if (num >= 45) return "#f59e0b";
    return "#ff4e64";
  })();

  return (
    <div style={{
      position: "sticky", top: 0, height: "100dvh",
      display: "flex", flexDirection: "column",
      background: "#000", borderRight: "1px solid #222",
      overflow: "hidden",
    }}>
      {/* Video player — fills full panel, black bg, video keeps aspect ratio */}
      <div style={{
        background: "#000", position: "relative",
        flex: 1, minHeight: 0,
      }}>
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onLoadedMetadata={() => { if (timestamps.length > 0) seekTo(0); }}
        />

        {/* Transport controls */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          transform: "translateY(-50%)", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 20,
        }}>
          <TransportButton onClick={handlePrev} label="Previous" size={40}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
              <rect x="2" y="3" width="2" height="10" /><path d="M14 3L6 8l8 5V3z" />
            </svg>
          </TransportButton>
          <TransportButton onClick={handlePlayPause} label="Play/Pause" size={52}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
              <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
              <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
            </svg>
          </TransportButton>
          <TransportButton onClick={handleNext} label="Next" size={40}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
              <rect x="12" y="3" width="2" height="10" /><path d="M2 3l8 5-8 5V3z" />
            </svg>
          </TransportButton>
        </div>

        {/* Timeline bar */}
        <div style={{ position: "absolute", bottom: 10, left: 16, right: 16, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, background: "rgba(214,214,214,0.58)", borderRadius: 20, position: "relative", overflow: "visible" }}>
            {!hasStreakRanges && (
              <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: `${((timestamps[currentIndex] || 0) / videoDuration) * 100}%`, background: "white", borderRadius: 20 }} />
            )}
            {hasStreakRanges && streakRanges.map((range: VideoTimelineRange, i: number) => {
              const leftPct = (range.start / videoDuration) * 100;
              const widthPct = ((range.end - range.start) / videoDuration) * 100;
              return (
                <div key={i} onClick={() => { if (videoRef.current) videoRef.current.currentTime = range.start; }}
                  style={{ position: "absolute", left: `${leftPct}%`, top: -3, width: `${Math.max(widthPct, 2)}%`, height: 10, background: range.type === "player" ? "#3e95f3" : "#f5364d", borderRadius: 15, cursor: "pointer", zIndex: 2 }} />
              );
            })}
          </div>
        </div>

        {/* Instance ticks */}
        {!hasStreakRanges && timestamps.length > 0 && (
          <div style={{ position: "absolute", bottom: 2, left: 16, right: 16, height: 24 }}>
            {timestamps.map((ts, i) => (
              <div key={i} onClick={() => { setCurrentIndex(i); seekTo(i); }}
                style={{ position: "absolute", left: `${(ts / videoDuration) * 100}%`, bottom: 5, width: 4, height: 14, background: i === currentIndex ? "#ec5e26" : "white", borderRadius: 15, transform: "translateX(-2px)", cursor: "pointer", zIndex: i === currentIndex ? 2 : 1 }} />
            ))}
          </div>
        )}

        {/* Counter */}
        {timestamps.length > 0 && (
          <div style={{ position: "absolute", top: 10, right: 14, fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.4)", padding: "2px 10px", borderRadius: 10 }}>
            {currentIndex + 1}/{timestamps.length}
          </div>
        )}
      </div>

    </div>
  );
}
