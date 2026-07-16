import {
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

import "./ZoomControls.css";

function ZoomControls({
  zoom = 60,

  onZoomIn,
  onZoomOut,
  onFit,
  onReset,

  disabled = false,
}) {
  const safeZoom =
    Number.isFinite(
      Number(zoom)
    )
      ? Math.round(
          Number(zoom)
        )
      : 60;

  return (
    <div className="zoom-controls">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={
          disabled ||
          safeZoom <= 10
        }
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus size={17} />
      </button>

      <button
        type="button"
        className="zoom-controls__value"
        onClick={onReset}
        disabled={disabled}
        title="Reset zoom to 100%"
      >
        {safeZoom}%
      </button>

      <button
        type="button"
        onClick={onZoomIn}
        disabled={
          disabled ||
          safeZoom >= 250
        }
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus size={17} />
      </button>

      <i />

      <button
        type="button"
        onClick={onFit}
        disabled={disabled}
        aria-label="Fit canvas"
        title="Fit canvas"
      >
        <Maximize2 size={17} />
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset zoom"
        title="Reset zoom to 100%"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

export default ZoomControls;