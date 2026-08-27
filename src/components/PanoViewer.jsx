import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from "lucide-react";

const PanoViewer = ({ imageUrl, hotspots = [], onHotspotClick }) => {
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

  return (
    <div className="relative w-full h-96 bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Panorama Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
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
            <div
              key={index}
              className="pano-hotspot"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              onClick={() => onHotspotClick && onHotspotClick(hotspot)}
              title={hotspot.title}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() => setRotation(0)}
            className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors">
            <Volume2 size={20} />
          </button>

          <button className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">🌐 360° View • Drag to explore</p>
      </div>
    </div>
  );
};

export default PanoViewer;
