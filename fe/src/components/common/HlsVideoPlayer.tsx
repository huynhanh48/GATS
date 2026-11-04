"use client";

import React, { useEffect, useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
  type MediaTimeUpdateEventDetail,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface HlsVideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  onReady?: () => void;
  /** Resume playback from this second (once metadata is ready). */
  initialTime?: number;
  /** Called while playing / on pause / ended. */
  onTimeUpdate?: (watchedSeconds: number, durationSeconds: number) => void;
  /** Explicit pause/ended hook for forced progress save. */
  onPlaybackPause?: (watchedSeconds: number, durationSeconds: number) => void;
}

/**
 * Course video player — Vidstack Default Layout (HLS + quality menu + PiP).
 * Keeps the same prop API as the previous hls.js + native &lt;video&gt; wrapper.
 */
export function HlsVideoPlayer({
  url,
  autoPlay = true,
  onReady,
  initialTime,
  onTimeUpdate,
  onPlaybackPause,
}: HlsVideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const seekAppliedRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onPlaybackPauseRef = useRef(onPlaybackPause);
  onPlaybackPauseRef.current = onPlaybackPause;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const initialTimeRef = useRef(initialTime);
  initialTimeRef.current = initialTime;

  useEffect(() => {
    seekAppliedRef.current = false;
  }, [url]);

  const reportTime = (
    cb: ((watched: number, duration: number) => void) | undefined,
    currentTime?: number,
  ) => {
    const player = playerRef.current;
    if (!player || !cb) return;
    const watched = Math.floor(currentTime ?? player.currentTime ?? 0);
    const duration = Math.floor(player.duration || 0);
    if (duration > 0) cb(watched, duration);
  };

  const applySeekIfNeeded = () => {
    const player = playerRef.current;
    const t = initialTimeRef.current;
    if (!player || seekAppliedRef.current) return;
    if (typeof t !== "number" || t <= 0 || !Number.isFinite(t)) return;
    try {
      player.currentTime = t;
      seekAppliedRef.current = true;
    } catch {
      // ignore seek failures
    }
  };

  // If resume time arrives after can-play, seek without remounting.
  useEffect(() => {
    if (!url) return;
    applySeekIfNeeded();
  }, [initialTime, url]);

  if (!url) return null;

  return (
    <MediaPlayer
      key={url}
      ref={playerRef}
      className="hls-vidstack-player h-full w-full rounded-xl overflow-hidden bg-black font-sans text-white ring-1 ring-white/10"
      src={url}
      viewType="video"
      streamType="on-demand"
      logLevel="warn"
      crossOrigin
      playsInline
      autoPlay={autoPlay}
      onCanPlay={() => {
        applySeekIfNeeded();
        onReadyRef.current?.();
      }}
      onTimeUpdate={(detail: MediaTimeUpdateEventDetail) => {
        reportTime(onTimeUpdateRef.current, detail.currentTime);
      }}
      onPause={() => {
        reportTime(onPlaybackPauseRef.current);
      }}
      onEnded={() => {
        reportTime(onPlaybackPauseRef.current);
      }}
    >
      <MediaProvider />
      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        // Hide download — course content should not expose direct file save.
        slots={{
          downloadButton: null,
        }}
      />
    </MediaPlayer>
  );
}
