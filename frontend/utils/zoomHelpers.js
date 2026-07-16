/*
|--------------------------------------------------------------------------
| Zoom Helpers
|--------------------------------------------------------------------------
|
| Handles only viewport zoom.
|
| Does NOT modify canvas objects.
|
*/

export const MIN_ZOOM = 0.15;

export const MAX_ZOOM = 5;

export const DEFAULT_ZOOM = 1;

/*
|--------------------------------------------------------------------------
| Clamp Zoom
|--------------------------------------------------------------------------
*/

function clampZoom(value) {
  const zoom = Number(value);

  if (!Number.isFinite(zoom)) {
    return DEFAULT_ZOOM;
  }

  return Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, zoom)
  );
}

/*
|--------------------------------------------------------------------------
| Get Current Zoom
|--------------------------------------------------------------------------
*/

export function getZoom(canvas) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  return clampZoom(
    canvas.getZoom()
  );
}

/*
|--------------------------------------------------------------------------
| Set Zoom
|--------------------------------------------------------------------------
*/

export function setZoom(
  canvas,
  zoom
) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  const safeZoom =
    clampZoom(zoom);

  canvas.setZoom(
    safeZoom
  );

  canvas.requestRenderAll();

  return safeZoom;
}

/*
|--------------------------------------------------------------------------
| Zoom In
|--------------------------------------------------------------------------
*/

export function zoomIn(
  canvas,
  step = 0.10
) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  return setZoom(
    canvas,
    getZoom(canvas) + step
  );
}

/*
|--------------------------------------------------------------------------
| Zoom Out
|--------------------------------------------------------------------------
*/

export function zoomOut(
  canvas,
  step = 0.10
) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  return setZoom(
    canvas,
    getZoom(canvas) - step
  );
}

/*
|--------------------------------------------------------------------------
| Reset Zoom
|--------------------------------------------------------------------------
*/

export function resetZoom(
  canvas
) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  canvas.setViewportTransform([
    1,
    0,
    0,
    1,
    0,
    0,
  ]);

  canvas.setZoom(
    DEFAULT_ZOOM
  );

  canvas.requestRenderAll();

  return DEFAULT_ZOOM;
}

/*
|--------------------------------------------------------------------------
| Fit Workspace
|--------------------------------------------------------------------------
|
| Fits the white poster
| inside the available workspace.
|
*/

export function fitWorkspace(
  canvas,
  workspaceWidth,
  workspaceHeight
) {
  if (!canvas) {
    return DEFAULT_ZOOM;
  }

  const posterWidth =
    canvas.getWidth();

  const posterHeight =
    canvas.getHeight();

  if (
    !posterWidth ||
    !posterHeight
  ) {
    return DEFAULT_ZOOM;
  }

  const horizontal =
    workspaceWidth /
    posterWidth;

  const vertical =
    workspaceHeight /
    posterHeight;

  /*
   * Leave padding
   */

  const zoom =
    Math.min(
      horizontal,
      vertical
    ) * 0.90;

  return setZoom(
    canvas,
    zoom
  );
}

/*
|--------------------------------------------------------------------------
| Zoom Percentage
|--------------------------------------------------------------------------
*/

export function getZoomPercentage(
  canvas
) {
  return Math.round(
    getZoom(canvas) * 100
  );
}