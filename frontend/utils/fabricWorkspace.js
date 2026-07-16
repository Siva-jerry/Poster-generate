import {
  Canvas,
} from "fabric";

/*
|--------------------------------------------------------------------------
| Workspace constants
|--------------------------------------------------------------------------
*/

export const DEFAULT_POSTER_WIDTH =
  1080;

export const DEFAULT_POSTER_HEIGHT =
  1350;

export const DEFAULT_POSTER_BACKGROUND =
  "#FFFFFF";

/*
|--------------------------------------------------------------------------
| Safe number helper
|--------------------------------------------------------------------------
*/

function toPositiveNumber(
  value,
  fallback
) {
  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue <= 0
  ) {
    return fallback;
  }

  return parsedValue;
}

/*
|--------------------------------------------------------------------------
| Safe colour helper
|--------------------------------------------------------------------------
*/

function toSafeColor(
  value,
  fallback
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  return value.trim();
}

/*
|--------------------------------------------------------------------------
| Create Fabric workspace
|--------------------------------------------------------------------------
|
| canvasElement:
| The real HTML <canvas> DOM element.
|
| This function creates only the editable white poster artboard.
| Templates and design objects will be added later.
|
*/

export function createFabricWorkspace({
  canvasElement,

  width =
    DEFAULT_POSTER_WIDTH,

  height =
    DEFAULT_POSTER_HEIGHT,

  backgroundColor =
    DEFAULT_POSTER_BACKGROUND,

  preserveObjectStacking = true,

  selection = true,
} = {}) {
  if (!canvasElement) {
    throw new Error(
      "A canvas HTML element is required to create the Fabric workspace."
    );
  }

  /*
   * Prevent creating Fabric twice on the same HTML canvas.
   */
  if (
    canvasElement.__fabricWorkspace
  ) {
    return canvasElement
      .__fabricWorkspace;
  }

  const safeWidth =
    toPositiveNumber(
      width,
      DEFAULT_POSTER_WIDTH
    );

  const safeHeight =
    toPositiveNumber(
      height,
      DEFAULT_POSTER_HEIGHT
    );

  const safeBackground =
    toSafeColor(
      backgroundColor,
      DEFAULT_POSTER_BACKGROUND
    );

  const canvas =
    new Canvas(
      canvasElement,
      {
        width: safeWidth,
        height: safeHeight,

        backgroundColor:
          safeBackground,

        preserveObjectStacking:
          Boolean(
            preserveObjectStacking
          ),

        selection:
          Boolean(selection),

        /*
         * Keep selection controls visible
         * above the poster objects.
         */
        controlsAboveOverlay:
          true,

        /*
         * Disable browser context menu
         * over the editor.
         */
        stopContextMenu:
          true,

        /*
         * Allow Fabric to receive
         * right-click events later.
         */
        fireRightClick:
          true,

        /*
         * Users can scale width and height
         * independently when Shift behaviour
         * is not being applied.
         */
        uniformScaling:
          false,

        /*
         * Keep object stack order while
         * selecting objects.
         */
        preserveObjectStacking:
          true,

        /*
         * Smoother drawing output.
         */
        enableRetinaScaling:
          true,

        /*
         * Default selection appearance.
         */
        selectionColor:
          "rgba(255, 107, 26, 0.10)",

        selectionBorderColor:
          "#FF6B1A",

        selectionLineWidth:
          1.5,

        /*
         * Avoid rendering until the
         * configuration is complete.
         */
        renderOnAddRemove:
          true,
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Additional canvas configuration
  |--------------------------------------------------------------------------
  */

  canvas.setDimensions({
    width: safeWidth,
    height: safeHeight,
  });

  canvas.backgroundColor =
    safeBackground;

  canvas.setViewportTransform([
    1,
    0,
    0,
    1,
    0,
    0,
  ]);

  canvas.discardActiveObject();

  canvas.requestRenderAll();

  /*
   * Save the instance on the HTML element.
   * This protects React StrictMode from
   * accidentally initializing Fabric twice.
   */
  canvasElement.__fabricWorkspace =
    canvas;

  return canvas;
}

/*
|--------------------------------------------------------------------------
| Resize logical poster dimensions
|--------------------------------------------------------------------------
|
| This changes the real poster size.
| It does not perform visual zoom.
|
*/

export function resizeFabricWorkspace(
  canvas,
  {
    width,
    height,
  } = {}
) {
  if (!canvas) {
    return null;
  }

  const safeWidth =
    toPositiveNumber(
      width,
      canvas.getWidth() ||
        DEFAULT_POSTER_WIDTH
    );

  const safeHeight =
    toPositiveNumber(
      height,
      canvas.getHeight() ||
        DEFAULT_POSTER_HEIGHT
    );

  canvas.setDimensions({
    width: safeWidth,
    height: safeHeight,
  });

  canvas.calcOffset();

  canvas.requestRenderAll();

  return {
    width: safeWidth,
    height: safeHeight,
  };
}

/*
|--------------------------------------------------------------------------
| Change poster background
|--------------------------------------------------------------------------
*/

export function setWorkspaceBackground(
  canvas,
  backgroundColor
) {
  if (!canvas) {
    return;
  }

  const safeBackground =
    toSafeColor(
      backgroundColor,
      DEFAULT_POSTER_BACKGROUND
    );

  canvas.backgroundColor =
    safeBackground;

  canvas.requestRenderAll();
}

/*
|--------------------------------------------------------------------------
| Reset viewport only
|--------------------------------------------------------------------------
|
| This resets pan and zoom without removing objects.
|
*/

export function resetWorkspaceViewport(
  canvas
) {
  if (!canvas) {
    return;
  }

  canvas.setViewportTransform([
    1,
    0,
    0,
    1,
    0,
    0,
  ]);

  canvas.setZoom(1);

  canvas.calcOffset();

  canvas.requestRenderAll();
}

/*
|--------------------------------------------------------------------------
| Clear all poster objects
|--------------------------------------------------------------------------
|
| The background is restored after canvas.clear().
|
*/

export function clearFabricWorkspace(
  canvas,
  {
    backgroundColor =
      DEFAULT_POSTER_BACKGROUND,
  } = {}
) {
  if (!canvas) {
    return;
  }

  const safeBackground =
    toSafeColor(
      backgroundColor,
      DEFAULT_POSTER_BACKGROUND
    );

  canvas.discardActiveObject();

  canvas.clear();

  canvas.backgroundColor =
    safeBackground;

  canvas.setViewportTransform([
    1,
    0,
    0,
    1,
    0,
    0,
  ]);

  canvas.requestRenderAll();
}

/*
|--------------------------------------------------------------------------
| Refresh canvas layout
|--------------------------------------------------------------------------
|
| Call this after:
|
| - sidebar width changes;
| - browser window resizes;
| - workspace panel opens or closes.
|
*/

export function refreshFabricWorkspace(
  canvas
) {
  if (!canvas) {
    return;
  }

  canvas.calcOffset();

  canvas.getObjects().forEach(
    (object) => {
      object.setCoords();
    }
  );

  canvas.requestRenderAll();
}

/*
|--------------------------------------------------------------------------
| Get workspace information
|--------------------------------------------------------------------------
*/

export function getWorkspaceDetails(
  canvas
) {
  if (!canvas) {
    return {
      ready: false,
      width: 0,
      height: 0,
      zoom: 1,
      objectCount: 0,
    };
  }

  return {
    ready: true,

    width:
      canvas.getWidth(),

    height:
      canvas.getHeight(),

    zoom:
      canvas.getZoom(),

    objectCount:
      canvas.getObjects()
        .length,

    hasSelection:
      Boolean(
        canvas.getActiveObject()
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Dispose Fabric workspace
|--------------------------------------------------------------------------
|
| This should run when React unmounts the editor.
|
*/

export async function disposeFabricWorkspace({
  canvas,
  canvasElement,
} = {}) {
  if (!canvas) {
    if (
      canvasElement
        ?.__fabricWorkspace
    ) {
      delete canvasElement
        .__fabricWorkspace;
    }

    return;
  }

  /*
   * Remove the custom reference before disposal.
   */
  const resolvedCanvasElement =
    canvasElement ||
    canvas.lowerCanvasEl ||
    null;

  if (
    resolvedCanvasElement
      ?.__fabricWorkspace ===
    canvas
  ) {
    delete resolvedCanvasElement
      .__fabricWorkspace;
  }

  try {
    canvas.discardActiveObject();

    canvas.off();

    /*
     * Fabric 6/7 disposal may return
     * a promise, so awaiting works for
     * both asynchronous and synchronous
     * disposal behaviour.
     */
    await canvas.dispose();
  } catch (error) {
    console.error(
      "Unable to dispose the Fabric workspace safely:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| Validate workspace instance
|--------------------------------------------------------------------------
*/

export function isFabricWorkspaceReady(
  canvas
) {
  return Boolean(
    canvas &&
      !canvas.disposed &&
      !canvas.destroyed &&
      canvas.lowerCanvasEl
  );
}