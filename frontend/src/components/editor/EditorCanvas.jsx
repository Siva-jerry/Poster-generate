import {
  AlertTriangle,
  Check,
  LoaderCircle,
  Maximize2,
  MousePointer2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import ZoomControls from "./ZoomControls";

import "./EditorCanvas.css";

/*
|--------------------------------------------------------------------------
| EditorCanvas
|--------------------------------------------------------------------------
|
| Responsibilities:
|
| 1. Attach the HTML canvas to Fabric.
| 2. Provide the scrollable workspace.
| 3. Show loading, error and ready states.
| 4. Display zoom controls.
|
| Fabric editing logic remains inside useFabricCanvas.js.
|
*/

function EditorCanvas({
  canvasElementRef,
  workspaceElementRef,

  canvas,
  zoom = 60,

  loading = false,
  ready = false,
  error = "",

  onZoomIn,
  onZoomOut,
  onFit,
  onResetZoom,
}) {
  const canvasAvailable =
    Boolean(canvas);

  return (
    <section className="editor-canvas">
      {/*
      |--------------------------------------------------------------------------
      | Workspace header
      |--------------------------------------------------------------------------
      */}

      <div className="editor-canvas__workspace-header">
        <div className="editor-canvas__workspace-status">
          <span
            className={[
              "editor-canvas__status-dot",
              ready
                ? "editor-canvas__status-dot--ready"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />

          <div>
            <strong>
              {loading
                ? "Preparing canvas"
                : ready
                  ? "Editable design canvas"
                  : "Canvas starting"}
            </strong>

            <small>
              {loading
                ? "Loading editable poster layers..."
                : ready
                  ? "Click any element to select and edit it."
                  : "Waiting for Fabric.js..."}
            </small>
          </div>
        </div>

        <div className="editor-canvas__workspace-actions">
          <button
            type="button"
            onClick={onFit}
            disabled={
              !canvasAvailable
            }
            title="Fit poster to workspace"
          >
            <Maximize2 size={16} />
            <span>Fit</span>
          </button>

          <button
            type="button"
            onClick={onResetZoom}
            disabled={
              !canvasAvailable
            }
            title="Reset zoom to 100%"
          >
            <RotateCcw size={16} />
            <span>100%</span>
          </button>
        </div>
      </div>

      {/*
      |--------------------------------------------------------------------------
      | Scrollable workspace
      |--------------------------------------------------------------------------
      */}

      <div
        ref={workspaceElementRef}
        className={[
          "editor-canvas__workspace",
          loading
            ? "editor-canvas__workspace--loading"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="editor-canvas__stage">
          {/*
          |--------------------------------------------------------------------------
          | Fabric canvas mount point
          |--------------------------------------------------------------------------
          |
          | Fabric automatically wraps this canvas in:
          |
          | <div class="canvas-container">
          |   <canvas class="lower-canvas" />
          |   <canvas class="upper-canvas" />
          | </div>
          |
          */}

          <canvas
            ref={canvasElementRef}
            className="editor-canvas__element"
            aria-label="SmartWish AI editable poster canvas"
          />

          {/*
          |--------------------------------------------------------------------------
          | Initial loading state
          |--------------------------------------------------------------------------
          */}

          {loading && (
            <div className="editor-canvas__state editor-canvas__state--loading">
              <div className="editor-canvas__state-icon">
                <LoaderCircle
                  size={30}
                />
              </div>

              <strong>
                Creating editable layers
              </strong>

              <p>
                SmartWish AI is loading the
                template, text, colours,
                photos and design elements.
              </p>
            </div>
          )}

          {/*
          |--------------------------------------------------------------------------
          | Fabric initialization state
          |--------------------------------------------------------------------------
          */}

          {!loading &&
            !ready &&
            !error && (
              <div className="editor-canvas__state">
                <div className="editor-canvas__state-icon">
                  <Sparkles
                    size={28}
                  />
                </div>

                <strong>
                  Starting the editor
                </strong>

                <p>
                  Preparing the Fabric
                  canvas and editable poster
                  workspace.
                </p>
              </div>
            )}

          {/*
          |--------------------------------------------------------------------------
          | Canvas error
          |--------------------------------------------------------------------------
          */}

          {!loading &&
            error && (
              <div className="editor-canvas__state editor-canvas__state--error">
                <div className="editor-canvas__state-icon">
                  <AlertTriangle
                    size={28}
                  />
                </div>

                <strong>
                  Unable to display the
                  poster
                </strong>

                <p>{error}</p>
              </div>
            )}
        </div>

        {/*
        |--------------------------------------------------------------------------
        | Editing helper
        |--------------------------------------------------------------------------
        */}

        {ready &&
          !loading &&
          !error && (
            <div className="editor-canvas__editing-tip">
              <MousePointer2
                size={15}
              />

              <span>
                Select an element, drag to
                move, use handles to resize
                and double-click text to
                edit.
              </span>

              <Check size={14} />
            </div>
          )}
      </div>

      {/*
      |--------------------------------------------------------------------------
      | Zoom controls
      |--------------------------------------------------------------------------
      */}

      <div className="editor-canvas__zoom">
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
          onReset={onResetZoom}
          disabled={
            !canvasAvailable ||
            loading
          }
        />
      </div>
    </section>
  );
}

export default EditorCanvas;