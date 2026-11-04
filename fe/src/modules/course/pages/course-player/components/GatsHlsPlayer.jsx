import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Gauge,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';

/**
 * GatsHlsPlayer - Trình phát video chuyên nghiệp tối ưu 100% cho React 19 + Vite
 * - Tự động nhận diện và stream HLS (.m3u8) hoặc MP4 trực tiếp
 * - Menu Cài đặt (⚙️) hỗ trợ:
 *    + Điều chỉnh độ phân giải: Auto, 1080p, 720p, 360p...
 *    + Điều chỉnh tốc độ phát: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
 * - Thanh tua tiến độ mượt mà, thời gian hiện tại / tổng thời lượng
 * - Tự động ẩn thanh điều khiển khi không di chuột
 */
export default function GatsHlsPlayer({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  initialTime = 0,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  // Cài đặt Quality & Speed
  const [levels, setLevels] = useState([]); // [{ id: -1, label: 'Auto' }, { id: 0, label: '1080p' }...]
  const [currentLevel, setCurrentLevel] = useState(-1); // -1: Auto
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsMenu, setSettingsMenu] = useState(null); // null | 'main' | 'quality' | 'speed'

  // Khởi tạo HLS / Native Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsSupported = Hls.isSupported();
    const isM3u8 = src.includes('.m3u8');

    if (isM3u8 && isHlsSupported) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const qualityLevels = [{ id: -1, label: 'Auto' }];
        if (Array.isArray(data.levels)) {
          data.levels.forEach((lvl, idx) => {
            qualityLevels.push({
              id: idx,
              label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
              bitrate: lvl.bitrate,
            });
          });
        }
        setLevels(qualityLevels);

        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentLevel(-1);
        } else {
          setCurrentLevel(data.level);
        }
      });
    } else {
      // Direct MP4 / Safari native HLS
      video.src = src;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, initialTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdateInternal = () => {
    const video = videoRef.current;
    if (!video) return;
    const curr = video.currentTime;
    const dur = video.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);

    if (onTimeUpdate) {
      onTimeUpdate({
        currentTime: curr,
        duration: dur,
        percentage: dur > 0 ? (curr / dur) * 100 : 0,
      });
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.max(0, Math.min(duration, pos * duration));
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    setVolume(val);
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.5;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectQuality = (lvlId) => {
    setCurrentLevel(lvlId);
    if (hlsRef.current) {
      if (lvlId === -1) {
        hlsRef.current.currentLevel = -1; // Auto
      } else {
        hlsRef.current.currentLevel = lvlId;
      }
    }
    setSettingsMenu(null);
  };

  const handleSelectSpeed = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSettingsMenu(null);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const currentQualityLabel =
    levels.find((l) => l.id === currentLevel)?.label || 'Auto';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full h-full bg-black rounded-[10px] overflow-hidden select-none group shadow-xl"
    >
      <video
        ref={videoRef}
        poster={poster}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdateInternal}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Nút Play to ở giữa khi đang Pause */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#1a56db]/90 hover:bg-[#1545b3] text-white flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
        >
          <Play size={28} className="ml-1 fill-current" />
        </div>
      )}

      {/* Menu Cài Đặt (Quality / Speed Dropdown Popover) */}
      {settingsMenu && (
        <div
          className="absolute bottom-16 right-4 w-56 bg-slate-900/95 backdrop-blur-md rounded-[10px] border border-white/10 shadow-2xl p-2 z-50 text-white text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {settingsMenu === 'main' && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSettingsMenu('quality')}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" />
                  <span>Chất lượng</span>
                </div>
                <span className="text-slate-400 font-semibold">{currentQualityLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsMenu('speed')}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-amber-400" />
                  <span>Tốc độ phát</span>
                </div>
                <span className="text-slate-400 font-semibold">{playbackRate}x</span>
              </button>
            </div>
          )}

          {settingsMenu === 'quality' && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10 mb-1">
                <span className="font-bold text-slate-300">Độ phân giải</span>
                <button
                  type="button"
                  onClick={() => setSettingsMenu('main')}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Quay lại
                </button>
              </div>
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSelectQuality(lvl.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer ${
                    currentLevel === lvl.id ? 'bg-[#1a56db] text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{lvl.label}</span>
                  {currentLevel === lvl.id && <Check size={13} />}
                </button>
              ))}
            </div>
          )}

          {settingsMenu === 'speed' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10 mb-1">
                <span className="font-bold text-slate-300">Tốc độ phát</span>
                <button
                  type="button"
                  onClick={() => setSettingsMenu('main')}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Quay lại
                </button>
              </div>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => handleSelectSpeed(spd)}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer ${
                    playbackRate === spd ? 'bg-[#1a56db] text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{spd === 1 ? '1.0x (Chuẩn)' : `${spd}x`}</span>
                  {playbackRate === spd && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thanh Điều Khiển Control Bar Chuẩn MasterStudy UI */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Time Bar (Thanh tiến độ video) */}
        <div
          onClick={handleSeek}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all mb-3 group/bar"
        >
          <div
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            className="h-full bg-[#1a56db] rounded-full relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform" />
          </div>
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          {/* Cụm Trái: Play/Pause, Volume, Thời Gian */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? <Pause size={17} className="fill-current" /> : <Play size={17} className="fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (v) v.currentTime = Math.max(0, v.currentTime - 10);
              }}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer hidden xs:inline-block"
              title="Lùi 10 giây"
            >
              <RotateCcw size={15} />
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
                aria-label="Âm lượng"
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-18 h-1 accent-[#1a56db] bg-white/30 rounded-lg cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>

            <span className="font-mono text-[11px] text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Cụm Phải: Cài Đặt (Quality/Speed), Toàn Màn Hình */}
          <div className="flex items-center gap-2">
            {/* Nút Setting Mở Menu */}
            <button
              type="button"
              onClick={() => setSettingsMenu(settingsMenu ? null : 'main')}
              className={`p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${
                settingsMenu ? 'text-blue-400 bg-white/15' : 'hover:text-blue-400'
              }`}
              title="Cài đặt độ phân giải và tốc độ"
            >
              <Settings size={17} />
            </button>

            {/* Nút Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
