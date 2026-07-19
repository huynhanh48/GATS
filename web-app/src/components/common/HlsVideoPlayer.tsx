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

    let hls: Hls;

    const handleReady = () => {
      setIsReady(true);
      if (onReady) onReady();
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
          video.play().catch(e => console.log("Autoplay blocked", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Lỗi kết nối mạng khi tải video.");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Lỗi định dạng video.");
              hls.recoverMediaError();
              break;
            default:
              setError("Video không thể phát.");
              hls.destroy();
              break;
          }
          setIsReady(true);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        handleReady();
        if (autoPlay) {
          video.play().catch(e => console.log("Autoplay blocked", e));
        }
      });
      video.addEventListener("error", () => {
        setError("Lỗi khi tải video.");
        setIsReady(true);
      });
    } else {
      setError("Trình duyệt không hỗ trợ xem video này.");
      setIsReady(true);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, autoPlay, onReady]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black text-red-500 p-4 text-center">
          <p>{error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain absolute top-0 left-0"
      />
    </div>
  );
}
