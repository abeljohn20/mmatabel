"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoSheetData, VideoTimelineRange } from "@/components/VideoSheet";
import { useSetActiveStep } from "@/lib/ActiveVideoContext";

const DEFAULT_SEEK_PADDING = 2; // 2-second padding before evidence frames
const PATTERN_SEEK_PADDING = 1; // 1-second padding for shot arsenal + winning/losing patterns

function getSeekPadding(sectionLabel?: string): number {
  if (!sectionLabel) return DEFAULT_SEEK_PADDING;
  const s = sectionLabel.toUpperCase();
  if (s.includes("SHOT ARSENAL") || s.includes("WINNING") || s.includes("LOSING")) return PATTERN_SEEK_PADDING;
  return DEFAULT_SEEK_PADDING;
}

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
  /** Called when the user navigates to a different instance index via prev/next/tick */
  onIndexChange?: (index: number) => void;
  /** External index override — when set, seeks to this index */
  externalIndex?: number;
}

export function DesktopVideoPanel({ data, videoSrc, onIndexChange, externalIndex }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timestamps = data?.timestamps ?? [];
  const streakRanges = data?.streakRanges;
  const hasStreakRanges = streakRanges && streakRanges.length > 0;
  const stepRanges = data?.stepRanges;
  const setActiveStep = useSetActiveStep();

  // Reset when data changes
  useEffect(() => {
    setCurrentIndex(0);
    setShowControls(true);
    if (videoRef.current && timestamps.length > 0) {
      videoRef.current.currentTime = Math.max(0, timestamps[0] - getSeekPadding(data?.sectionLabel));
    }
  }, [data?.title]);

  // Sync external index from court dot clicks
  useEffect(() => {
    if (externalIndex != null && externalIndex !== currentIndex && externalIndex < timestamps.length) {
      setCurrentIndex(externalIndex);
      seekToIndex(externalIndex);
    }
  }, [externalIndex]);

  // Track playback time + active step
  const handleTimeUpdate = useCallback(() => {
    if (!isSeeking && videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      // Update active step based on stepRanges
      // stepRanges may contain nSteps * nInstances entries — use modulo to get step index
      if (stepRanges && stepRanges.length > 0) {
        let idx = stepRanges.findIndex((r) => t >= r.start && t < r.end);
        if (idx === -1) {
          // Between instances — find which instance we're closest to
          if (t >= stepRanges[stepRanges.length - 1].end) idx = stepRanges.length - 1;
          else if (t < stepRanges[0].start) idx = 0;
          else {
            // Find the last range that ended before current time
            for (let j = stepRanges.length - 1; j >= 0; j--) {
              if (t >= stepRanges[j].start) { idx = j; break; }
            }
          }
        }
        // Get nSteps from data.steps length, convert flat idx to step index via modulo
        const nSteps = data?.steps?.length || 1;
        const stepIdx = idx >= 0 ? idx % nSteps : -1;
        setActiveStep(stepIdx);
      }
    }
  }, [isSeeking, stepRanges, setActiveStep]);

  // Reset/init active step when data changes — set step 0 if stepRanges exist
  useEffect(() => {
    if (stepRanges && stepRanges.length > 0) {
      setActiveStep(0);
    } else {
      setActiveStep(-1);
    }
  }, [data?.title, stepRanges, setActiveStep]);

  // Auto-hide controls when playing
  const startHideTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    startHideTimer();
  }, [startHideTimer]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
  }, []);

  const handleVideoClick = useCallback(() => {
    setShowControls(true);
    if (isPlaying) startHideTimer();
  }, [isPlaying, startHideTimer]);

  // Seek helpers with 1s padding
  const seekToIndex = useCallback((index: number) => {
    if (videoRef.current && timestamps[index] != null) {
      videoRef.current.currentTime = Math.max(0, timestamps[index] - getSeekPadding(data?.sectionLabel));
    }
  }, [timestamps]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.max(0, i - 1);
      seekToIndex(next);
      onIndexChange?.(next);
      return next;
    });
    setShowControls(true);
    if (isPlaying) startHideTimer();
  }, [seekToIndex, isPlaying, startHideTimer, onIndexChange]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(timestamps.length - 1, i + 1);
      seekToIndex(next);
      onIndexChange?.(next);
      return next;
    });
    setShowControls(true);
    if (isPlaying) startHideTimer();
  }, [timestamps.length, seekToIndex, isPlaying, startHideTimer]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, []);

  // Draggable seek
  const seekFromEvent = useCallback((clientX: number) => {
    const bar = timelineRef.current;
    if (!bar || !videoRef.current) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const duration = videoRef.current.duration || 2377;
    videoRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setIsSeeking(true);
    seekFromEvent(clientX);
  }, [seekFromEvent]);

  const handleDragMove = useCallback((clientX: number) => {
    if (isSeeking) seekFromEvent(clientX);
  }, [isSeeking, seekFromEvent]);

  const handleDragEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  // Mouse drag handlers
  useEffect(() => {
    if (!isSeeking) return;
    const onMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isSeeking, handleDragMove, handleDragEnd]);

  // Keyboard shortcuts — arrow keys to seek, space to play/pause
  const lastArrowPress = useRef<{ key: string; time: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const now = Date.now();
        const last = lastArrowPress.current;
        const isDouble = last && last.key === e.key && now - last.time < 300;
        const skip = isDouble ? 10 : 5;
        const dir = e.key === "ArrowRight" ? 1 : -1;

        videoRef.current.currentTime = Math.max(0, Math.min(
          videoRef.current.duration || 2377,
          videoRef.current.currentTime + dir * skip
        ));
        setCurrentTime(videoRef.current.currentTime);
        setShowControls(true);
        if (isPlaying) startHideTimer();

        lastArrowPress.current = { key: e.key, time: now };
      } else if (e.key === " ") {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, startHideTimer, handlePlayPause]);

  const duration = videoRef.current?.duration || 2377;
  const progressPct = (currentTime / duration) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      position: "sticky", top: 0, height: "100dvh",
      display: "flex", flexDirection: "column",
      background: "#000", borderRight: "1px solid #222",
      overflow: "hidden",
    }}>
      {/* Video — fills full panel */}
      <div
        style={{ background: "#000", position: "relative", flex: 1, minHeight: 0 }}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onLoadedMetadata={() => { if (timestamps.length > 0) seekToIndex(0); }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* Transport controls — auto-hide when playing */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          transform: "translateY(-50%)", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 20,
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          <TransportButton onClick={handlePrev} label="Previous" size={40}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
              <rect x="2" y="3" width="2" height="10" /><path d="M14 3L6 8l8 5V3z" />
            </svg>
          </TransportButton>
          <TransportButton onClick={handlePlayPause} label="Play/Pause" size={52}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
                <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
                <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </TransportButton>
          <TransportButton onClick={handleNext} label="Next" size={40}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
              <rect x="12" y="3" width="2" height="10" /><path d="M2 3l8 5-8 5V3z" />
            </svg>
          </TransportButton>
        </div>

        {/* Timeline bar with draggable seek handle + duration */}
        <div style={{
          position: "absolute", bottom: 12, left: 20, right: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
        <div
          ref={timelineRef}
          style={{
            flex: 1,
            height: 20, display: "flex", alignItems: "center",
            cursor: "pointer", touchAction: "none",
          }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* Track */}
          <div style={{ flex: 1, height: 4, background: "rgba(214,214,214,0.35)", borderRadius: 20, position: "relative", overflow: "visible" }}>
            {/* Progress fill */}
            <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: `${progressPct}%`, background: "white", borderRadius: 20 }} />

            {/* Streak range blocks */}
            {hasStreakRanges && streakRanges.map((range: VideoTimelineRange, i: number) => {
              const leftPct = (range.start / duration) * 100;
              const widthPct = ((range.end - range.start) / duration) * 100;
              return (
                <div key={i} onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime = range.start; }}
                  style={{ position: "absolute", left: `${leftPct}%`, top: -3, width: `${Math.max(widthPct, 2)}%`, height: 10, background: range.type === "player" ? "#3e95f3" : "#f5364d", borderRadius: 15, cursor: "pointer", zIndex: 2 }} />
              );
            })}

            {/* Instance ticks */}
            {!hasStreakRanges && timestamps.map((ts, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); seekToIndex(i); onIndexChange?.(i); }}
                style={{ position: "absolute", left: `${(ts / duration) * 100}%`, top: -5, width: 4, height: 14, background: i === currentIndex ? "#ec5e26" : "rgba(255,255,255,0.6)", borderRadius: 15, transform: "translateX(-2px)", cursor: "pointer", zIndex: i === currentIndex ? 3 : 1 }} />
            ))}

            {/* Drag handle */}
            <div style={{
              position: "absolute",
              left: `${progressPct}%`,
              top: -4,
              width: 12, height: 12,
              borderRadius: 6,
              background: "white",
              transform: "translateX(-6px)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              zIndex: 10,
              pointerEvents: "none",
            }} />
          </div>
        </div>
        {/* Duration text */}
        <span style={{
          fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)",
          whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        </div>

        {/* Counter */}
        {timestamps.length > 0 && (
          <div style={{
            position: "absolute", top: 12, right: 16, fontSize: 12,
            color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.5)",
            padding: "3px 10px", borderRadius: 10,
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            {currentIndex + 1}/{timestamps.length}
          </div>
        )}
      </div>
    </div>
  );
}
