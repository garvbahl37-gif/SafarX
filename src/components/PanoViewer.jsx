import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  RotateCcw,
} from "lucide-react";

/**
 * PanoViewer — lightweight panorama surface with SafarX chrome:
 * ink glass controls, gold waypoint hotspots, Space Grotesk readouts.
 */
const PanoViewer = ({ imageUrl, hotspots = [], onHotspotClick, placeName }) => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + 0.5) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      setRotation((prev) => prev + deltaX * 0.5);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const heading = ((Math.round(rotation) % 360) + 360) % 360;

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-950 shadow-2xl">
      {/* Panorama */}
      <div
        ref={containerRef}
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-100"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Hotspots */}
          {hotspots.map((hotspot, index) => (
            <button
              key={index}
              type="button"
              aria-label={hotspot.title || `Waypoint ${index + 1}`}
              title={hotspot.title}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => onHotspotClick && onHotspotClick(hotspot)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-saffron/40 bg-ink-950/70 backdrop-blur-md transition-colors duration-300 group-hover:border-saffron">
                <span className="route-dot" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Heads-up readout */}
      <div className="pointer-events-none absolute left-4 top-4">
        <div className="glass-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="route-dot animate-pulse" aria-hidden="true" />
            <span className="font-data text-[10px] uppercase tracking-[0.24em] text-saffron">
              360°
            </span>
          </div>
          {placeName && (
            <p className="mt-1 font-display text-sm font-medium italic text-ivory">{placeName}</p>
          )}
          <p className="mt-0.5 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
            Heading {heading}° · drag to explore
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/75 p-1.5 backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
            aria-pressed={isPlaying}
            className="flex h-9 w-9 items-center justify-center rounded-full text-saffron transition-colors hover:bg-white/[0.06]"
          >
            {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => setRotation(0)}
            aria-label="Reset the view to north"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory-muted transition-colors hover:bg-white/[0.06] hover:text-saffron"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/75 p-1.5 backdrop-blur-2xl">
          <button
            type="button"
            aria-label="Toggle ambient sound"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory-muted transition-colors hover:bg-white/[0.06] hover:text-saffron"
          >
            <Volume2 size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => containerRef.current?.requestFullscreen?.()}
            aria-label="Enter fullscreen"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory-muted transition-colors hover:bg-white/[0.06] hover:text-saffron"
          >
            <Maximize size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanoViewer;
