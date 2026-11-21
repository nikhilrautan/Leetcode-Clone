import { useState, useRef, useEffect } from 'react';
import { Pause, Play, VideoOff } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [secureUrl]);

  // Nothing to play for this problem
  if (!secureUrl) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 px-6 py-14 text-center">
        <VideoOff size={32} className="text-base-content/40" />
        <div>
          <p className="font-semibold">No video editorial yet</p>
          <p className="text-sm text-base-content/60">
            A video walkthrough has not been added for this problem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-box border border-base-300 bg-black shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="aspect-video w-full cursor-pointer bg-black"
      />

      {/* Big play button while paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label="Play"
          className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-content shadow-xl transition-transform hover:scale-105"
        >
          <Play size={28} className="ml-1" fill="currentColor" />
        </button>
      )}

      {/* Video Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            className="btn btn-circle btn-primary btn-sm"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Progress Bar */}
          <span className="w-10 text-right font-mono text-xs text-white">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
              }
            }}
            aria-label="Seek"
            className="range range-primary range-xs flex-1"
          />
          <span className="w-10 font-mono text-xs text-white">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Editorial;