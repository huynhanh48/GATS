"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

interface HlsVideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  onReady?: () => void;
}

export function HlsVideoPlayer({ url, autoPlay = true, onReady }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | undefined;
    setError(null);
    setIsReady(false);

    const handleReady = () => {
      setIsReady(true);
      onReady?.();
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        handleReady();
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay blocked by browser policy — user can press play.
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        // Non-fatal (buffer stall, fragment retry, etc.) — hls.js recovers itself.
        // Do NOT console.error: Next.js dev overlay treats that as a hard error.
        if (!data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError();
            break;
          default:
            setError("Video không thể phát.");
            setIsReady(true);
            hls?.destroy();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      const onLoaded = () => {
        handleReady();
        if (autoPlay) {
          video.play().catch(() => {});
        }
      };
      const onVideoError = () => {
        setError("Lỗi khi tải video.");
        setIsReady(true);
      };
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onVideoError);
      return () => {
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("error", onVideoError);
      };
    } else {
      setError("Trình duyệt không hỗ trợ xem video này.");
      setIsReady(true);
    }

    return () => {
      hls?.destroy();
    };
  }, [url, autoPlay, onReady]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      {!isReady && !error ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black p-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : null}

      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        className="absolute top-0 left-0 h-full w-full object-contain"
      />
    </div>
  );
}
