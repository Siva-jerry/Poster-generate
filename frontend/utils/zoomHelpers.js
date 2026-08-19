/*
|--------------------------------------------------------------------------
| Zoom Helpers for Fabric Artboard
|--------------------------------------------------------------------------
|
| Handles visual canvas scaling and artboard centering.
|
*/

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 3.0;
export const DEFAULT_ZOOM = 1;

export const POSTER_BASE_WIDTH = 1080;
export const POSTER_BASE_HEIGHT = 1350;

function clampZoom(value) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom)) {
    return DEFAULT_ZOOM;
  }
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function getZoom(canvas) {
  if (!canvas) return DEFAULT_ZOOM;
  return clampZoom(canvas.getZoom());
}

export function setZoom(canvas, zoom) {
  if (!canvas) return DEFAULT_ZOOM;

  const safeZoom = clampZoom(zoom);

  // Resize the DOM canvas wrapper to match the zoom size
  canvas.setDimensions({
    width: Math.round(POSTER_BASE_WIDTH * safeZoom),
    height: Math.round(POSTER_BASE_HEIGHT * safeZoom),
  });

  // Scale the viewport rendering
  canvas.setZoom(safeZoom);

  canvas.calcOffset();
  canvas.requestRenderAll();

  return safeZoom;
}

export function zoomIn(canvas, step = 0.05) {
  if (!canvas) return DEFAULT_ZOOM;
  return setZoom(canvas, getZoom(canvas) + step);
}

export function zoomOut(canvas, step = 0.05) {
  if (!canvas) return DEFAULT_ZOOM;
  return setZoom(canvas, getZoom(canvas) - step);
}

export function resetZoom(canvas) {
  if (!canvas) return DEFAULT_ZOOM;
  return setZoom(canvas, 1);
}

export function fitWorkspace(canvas, workspaceWidth, workspaceHeight) {
  if (!canvas) return DEFAULT_ZOOM;

  const availWidth = Math.max(workspaceWidth || 600, 300);
  const availHeight = Math.max(workspaceHeight || 600, 300);

  const horizontal = availWidth / POSTER_BASE_WIDTH;
  const vertical = availHeight / POSTER_BASE_HEIGHT;

  const zoom = Math.min(horizontal, vertical) * 0.90;

  return setZoom(canvas, zoom);
}

export function getZoomPercentage(canvas) {
  return Math.round(getZoom(canvas) * 100);
}