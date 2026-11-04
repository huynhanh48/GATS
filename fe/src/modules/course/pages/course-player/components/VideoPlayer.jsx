import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

/**
 * VideoPlayer - High-performance Video.js Wrapper
 * Tối ưu hóa render video ffmpeg HLS (.m3u8), MP4, và WebM từ Backend GATS
 * @param {Object} props
 * @param {Object} props.options - VideoJS configuration options (sources, controls, autoplay, etc.)
 * @param {Function} [props.onReady] - Callback khi player khởi tạo thành công
 * @param {Function} [props.onTimeUpdate] - Callback khi tiến độ video cập nhật
 * @param {Function} [props.onEnded] - Callback khi video chạy hết
 */
export default function VideoPlayer({ options, onReady, onTimeUpdate, onEnded }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Khởi tạo Video.js player một lần duy nhất khi component mount
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-default-skin', 'w-full', 'h-full', 'rounded-[10px]');
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        {
          responsive: true,
          fluid: true,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          controls: true,
          preload: 'auto',
          ...options,
        },
        () => {
          if (onReady) {
            onReady(player);
          }
        }
      ));

      if (onTimeUpdate) {
        player.on('timeupdate', () => {
          const currentTime = player.currentTime();
          const duration = player.duration();
          onTimeUpdate({ currentTime, duration, percentage: duration ? (currentTime / duration) * 100 : 0 });
        });
      }

      if (onEnded) {
        player.on('ended', () => {
          onEnded();
        });
      }
    } else if (playerRef.current) {
      // Cập nhật nguồn phát video khi options.sources thay đổi
      const player = playerRef.current;
      if (options.autoplay) {
        player.autoplay(options.autoplay);
      }
      if (options.sources) {
        player.src(options.sources);
      }
      if (options.poster) {
        player.poster(options.poster);
      }
    }
  }, [options, onReady, onTimeUpdate, onEnded]);

  // Dọn dẹp Video.js player khi component unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className="w-full h-full relative aspect-video rounded-[10px] overflow-hidden bg-black shadow-md">
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
}
