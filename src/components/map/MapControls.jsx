/**
 * MapControls — the floating glass control column (zoom, locate, layers,
 * fullscreen). Built from the shared ImmersiveChrome furniture.
 */

import React from "react";
import { Plus, Minus, LocateFixed, Layers, Maximize2, Minimize2, Compass } from "lucide-react";
import { GlassIconButton } from "../VirtualTour/ImmersiveChrome";

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onLocate,
  onToggleLayers,
  layersOpen,
  onToggleFullscreen,
  isFullscreen,
  onResetView,
  locating = false,
  className = "",
}) => (
  <div className={`flex flex-col items-end gap-2 ${className}`}>
    <GlassIconButton
      icon={Layers}
      label="Map layers"
      active={layersOpen}
      pressed={layersOpen}
      onClick={onToggleLayers}
    />

    <div className="flex flex-col overflow-hidden rounded-full border border-white/[0.09] bg-ink-950/70 backdrop-blur-xl">
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center text-ivory-muted transition-colors hover:bg-white/[0.07] hover:text-saffron"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="mx-2 border-t border-white/[0.07]" aria-hidden="true" />
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center text-ivory-muted transition-colors hover:bg-white/[0.07] hover:text-saffron"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <GlassIconButton
      icon={LocateFixed}
      label={locating ? "Finding your location" : "Locate me"}
      onClick={onLocate}
      active={locating}
    />
    <GlassIconButton icon={Compass} label="Reset to all India" onClick={onResetView} />
    <GlassIconButton
      icon={isFullscreen ? Minimize2 : Maximize2}
      label={isFullscreen ? "Exit fullscreen" : "Fullscreen map"}
      onClick={onToggleFullscreen}
      pressed={isFullscreen}
    />
  </div>
);

export default MapControls;
