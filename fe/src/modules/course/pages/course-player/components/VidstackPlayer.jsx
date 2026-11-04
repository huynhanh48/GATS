import React, { useEffect, useRef } from 'react';
import {
  MediaPlayer,
  MediaProvider,
} from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

/**
 * VidstackPlayer - Trình phát video chuyên nghiệp hỗ trợ HLS đa độ phân giải (1080p, 720p, 360p, Auto)
 * và điều chỉnh tốc độ (Speed: 0.5x đến 2x), chất lượng, PiP, Fullscreen.
 *
 * @param {Object} props
 * @param {string} props.src - URL video phát (HLS .m3u8, MP4, WebM)
 * @param {string} [props.poster] - URL ảnh thumbnail poster
 * @param {boolean} [props.autoPlay=false] - Tự động phát khi tải xong
 * @param {number} [props.initialTime=0] - Mốc thời gian tiếp tục phát (resume)
 * @param {Function} [props.onReady] - Callback khi player sẵn sàng
 * @param {Function} [props.onTimeUpdate] - Callback cập nhật thời gian xem { currentTime, duration, percentage }
 * @param {Function} [props.onEnded] - Callback khi xem hết video
 */
export default function VidstackPlayer({
  src,
  poster,
  autoPlay = false,
  initialTime = 0,
  onReady,
  onTimeUpdate,
  onEnded,
}) {
  const playerRef = useRef(null);
  const seekAppliedRef = useRef(false);

  useEffect(() => {
    seekAppliedRef.current = false;
  }, [src]);

  const applySeekIfNeeded = () => {
    const player = playerRef.current;
    if (!player || seekAppliedRef.current) return;
    if (typeof initialTime === 'number' && initialTime > 0) {
      try {
        player.currentTime = initialTime;
        seekAppliedRef.current = true;
      } catch {
        // Ignore seek error
      }
    }
  };

  if (!src) return null;

  return (
    <div className="w-full h-full relative aspect-video rounded-[10px] overflow-hidden bg-black shadow-lg ring-1 ring-white/10">
      <MediaPlayer
        key={src}
        ref={playerRef}
        className="w-full h-full font-sans text-white"
        src={src}
        poster={poster}
        viewType="video"
        streamType="on-demand"
        crossOrigin
        playsInline
        autoPlay={autoPlay}
        onCanPlay={() => {
          applySeekIfNeeded();
          if (onReady) onReady();
        }}
        onTimeUpdate={(detail) => {
          const currentTime = detail?.currentTime || 0;
          const duration = playerRef.current?.duration || 0;
          if (onTimeUpdate) {
            onTimeUpdate({
              currentTime,
              duration,
              percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
            });
          }
        }}
        onEnded={() => {
          if (onEnded) onEnded();
        }}
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          slots={{
            downloadButton: null, // Bảo vệ bản quyền video khóa học
          }}
        />
      </MediaPlayer>
    </div>
  );
}
