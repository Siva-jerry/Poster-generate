import {
  ActiveSelection,
  FabricImage,
  Gradient,
  Shadow,
} from "fabric";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useEditorStore from "../components/store/editorStore";

import {
  createFabricWorkspace,
  disposeFabricWorkspace,
  refreshFabricWorkspace,
} from "../../utils/fabricWorkspace";

import {
  fitWorkspace,
  getZoomPercentage,
  resetZoom as resetCanvasZoom,
  setZoom as setCanvasZoomValue,
  zoomIn as increaseCanvasZoom,
  zoomOut as decreaseCanvasZoom,
} from "../../utils/zoomHelpers";

import {
  attachCanvasEvents,
  attachCanvasKeyboardShortcuts,
  CANVAS_KEYBOARD_ACTIONS,
} from "../../utils/canvasEvents";
import {
  addHeadingText,
  addSubheadingText,
  addBodyText,

  updateActiveText,

  setTextContent,

  setTextFontFamily,
  setTextFontSize,

  setTextColor,

  setTextAlignment,

  toggleTextBold,
  toggleTextItalic,
  toggleTextUnderline,

  setTextLetterSpacing,
  setTextLineHeight,

  setTextShadow,
  removeTextShadow,

  setTextOutline,
  removeTextOutline,

  transformTextCase,

  getActiveTextObject,
} from "../../utils/textEngine";

/*
|--------------------------------------------------------------------------
| Canvas constants
|--------------------------------------------------------------------------
*/

const DEFAULT_CANVAS_WIDTH = 1080;
const DEFAULT_CANVAS_HEIGHT = 1350;
const DEFAULT_BACKGROUND = "#FFFFFF";

const MIN_ZOOM_PERCENT = 15;
const MAX_ZOOM_PERCENT = 500;

/*
|--------------------------------------------------------------------------
| Safe number helper
|--------------------------------------------------------------------------
*/

function toSafeNumber(
  value,
  fallback = 0
) {
  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : fallback;
}

/*
|--------------------------------------------------------------------------
| Remove selected objects
|--------------------------------------------------------------------------
*/

function removeSelectedObjects(
  canvas
) {
  if (!canvas) {
    return [];
  }

  const activeObjects =
    canvas.getActiveObjects?.() ||
    [];

  if (
    activeObjects.length === 0
  ) {
    return [];
  }

  canvas.discardActiveObject();

  activeObjects.forEach(
    (object) => {
      if (
        object.locked ||
        object.selectable === false
      ) {
        return;
      }

      canvas.remove(object);
    }
  );

  canvas.requestRenderAll();

  return activeObjects;
}

/*
|--------------------------------------------------------------------------
| Duplicate selected object
|--------------------------------------------------------------------------
*/

async function duplicateSelectedObject(
  canvas,
  offset = 30
) {
  if (!canvas) {
    return null;
  }

  const activeObject =
    canvas.getActiveObject?.();

  if (!activeObject) {
    return null;
  }

  const clonedObject =
    await activeObject.clone();

  clonedObject.set({
    left:
      toSafeNumber(
        activeObject.left,
        0
      ) + offset,

    top:
      toSafeNumber(
        activeObject.top,
        0
      ) + offset,

    evented: true,
    selectable: true,
  });

  canvas.discardActiveObject();

  /*
   * A copied ActiveSelection contains
   * several child objects.
   */
  if (
    clonedObject.type ===
      "activeselection" &&
    Array.isArray(
      clonedObject._objects
    )
  ) {
    clonedObject.canvas =
      canvas;

    clonedObject.forEachObject(
      (object) => {
        canvas.add(object);
      }
    );

    clonedObject.setCoords();

    canvas.setActiveObject(
      clonedObject
    );
  } else {
    canvas.add(clonedObject);

    canvas.setActiveObject(
      clonedObject
    );
  }

  canvas.requestRenderAll();

  return clonedObject;
}

/*
|--------------------------------------------------------------------------
| Select all editable objects
|--------------------------------------------------------------------------
*/

function selectAllObjects(
  canvas
) {
  if (!canvas) {
    return null;
  }

  const selectableObjects =
    canvas
      .getObjects()
      .filter(
        (object) =>
          object.selectable !==
            false &&
          object.evented !==
            false &&
          !object.locked
      );

  if (
    selectableObjects.length ===
    0
  ) {
    return null;
  }

  canvas.discardActiveObject();

  if (
    selectableObjects.length ===
    1
  ) {
    canvas.setActiveObject(
      selectableObjects[0]
    );

    canvas.requestRenderAll();

    return selectableObjects[0];
  }

  const selection =
    new ActiveSelection(
      selectableObjects,
      {
        canvas,
      }
    );

  canvas.setActiveObject(
    selection
  );

  canvas.requestRenderAll();

  return selection;
}

/*
|--------------------------------------------------------------------------
| Nudge selected object
|--------------------------------------------------------------------------
*/

function nudgeSelectedObject(
  canvas,
  action,
  distance
) {
  if (!canvas) {
    return;
  }

  const activeObject =
    canvas.getActiveObject?.();

  if (
    !activeObject ||
    activeObject.locked
  ) {
    return;
  }

  const safeDistance =
    toSafeNumber(
      distance,
      0
    );

  switch (action) {
    case CANVAS_KEYBOARD_ACTIONS
      .nudgeUp:
    case CANVAS_KEYBOARD_ACTIONS
      .nudgeDown:
      activeObject.set({
        top:
          toSafeNumber(
            activeObject.top,
            0
          ) + safeDistance,
      });
      break;

    case CANVAS_KEYBOARD_ACTIONS
      .nudgeLeft:
    case CANVAS_KEYBOARD_ACTIONS
      .nudgeRight:
      activeObject.set({
        left:
          toSafeNumber(
            activeObject.left,
            0
          ) + safeDistance,
      });
      break;

    default:
      return;
  }

  activeObject.setCoords();

  canvas.requestRenderAll();

  canvas.fire(
    "object:modified",
    {
      target: activeObject,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Main Fabric hook
|--------------------------------------------------------------------------
*/

function useFabricCanvas({
  canvasElementRef,
  workspaceElementRef,

  width =
    DEFAULT_CANVAS_WIDTH,

  height =
    DEFAULT_CANVAS_HEIGHT,

  backgroundColor =
    DEFAULT_BACKGROUND,

  onReady,
  onSelectionChange,
  onObjectModified,
  onCanvasChange,
  onSave,
} = {}) {
  /*
  |--------------------------------------------------------------------------
  | Local references
  |--------------------------------------------------------------------------
  */

  const canvasInstanceRef =
    useRef(null);

  const clipboardRef =
    useRef(null);

  const detachCanvasEventsRef =
    useRef(null);

  const detachKeyboardRef =
    useRef(null);

  const resizeObserverRef =
    useRef(null);

  const initializationRef =
    useRef(false);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  /*
  |--------------------------------------------------------------------------
  | Local state
  |--------------------------------------------------------------------------
  */

  const [
    canvas,
    setCanvasState,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Store state and actions
  |--------------------------------------------------------------------------
  */

  const zoom =
    useEditorStore(
      (state) =>
        state.zoom
    );

  const setCanvas =
    useEditorStore(
      (state) =>
        state.setCanvas
    );

  const clearCanvasReference =
    useEditorStore(
      (state) =>
        state.clearCanvasReference
    );

  const setCanvasSize =
    useEditorStore(
      (state) =>
        state.setCanvasSize
    );

  const setZoom =
    useEditorStore(
      (state) =>
        state.setZoom
    );

  const setSelectedObject =
    useEditorStore(
      (state) =>
        state.setSelectedObject
    );

  const clearSelectedObject =
    useEditorStore(
      (state) =>
        state.clearSelectedObject
    );

  const setEditorReady =
    useEditorStore(
      (state) =>
        state.setEditorReady
    );

  const setEditorError =
    useEditorStore(
      (state) =>
        state.setEditorError
    );

  const setDirty =
    useEditorStore(
      (state) =>
        state.setDirty
    );

  /*
  |--------------------------------------------------------------------------
  | Synchronize zoom state
  |--------------------------------------------------------------------------
  */

  const updateZoomState =
    useCallback(
      (fabricCanvas) => {
        if (!fabricCanvas) {
          return 100;
        }

        const percentage =
          getZoomPercentage(
            fabricCanvas
          );

        setZoom(percentage);

        return percentage;
      },
      [setZoom]
    );

  /*
  |--------------------------------------------------------------------------
  | Fit canvas
  |--------------------------------------------------------------------------
  */

  const fitToWorkspace =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const workspace =
        workspaceElementRef
          ?.current;

      if (
        !fabricCanvas ||
        !workspace
      ) {
        return 100;
      }

      const horizontalPadding =
        96;

      const verticalPadding =
        96;

      const availableWidth =
        Math.max(
          workspace.clientWidth -
            horizontalPadding,
          200
        );

      const availableHeight =
        Math.max(
          workspace.clientHeight -
            verticalPadding,
          200
        );

      fitWorkspace(
        fabricCanvas,
        availableWidth,
        availableHeight
      );

      refreshFabricWorkspace(
        fabricCanvas
      );

      return updateZoomState(
        fabricCanvas
      );
    }, [
      workspaceElementRef,
      updateZoomState,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Zoom in
  |--------------------------------------------------------------------------
  */

  const zoomIn =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      if (!fabricCanvas) {
        return 100;
      }

      increaseCanvasZoom(
        fabricCanvas,
        0.1
      );

      return updateZoomState(
        fabricCanvas
      );
    }, [updateZoomState]);

  /*
  |--------------------------------------------------------------------------
  | Zoom out
  |--------------------------------------------------------------------------
  */

  const zoomOut =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      if (!fabricCanvas) {
        return 100;
      }

      decreaseCanvasZoom(
        fabricCanvas,
        0.1
      );

      return updateZoomState(
        fabricCanvas
      );
    }, [updateZoomState]);

  /*
  |--------------------------------------------------------------------------
  | Set custom zoom percentage
  |--------------------------------------------------------------------------
  */

  const setCustomZoom =
    useCallback(
      (percentage) => {
        const fabricCanvas =
          canvasInstanceRef.current;

        if (!fabricCanvas) {
          return 100;
        }

        const safePercentage =
          Math.min(
            MAX_ZOOM_PERCENT,
            Math.max(
              MIN_ZOOM_PERCENT,
              toSafeNumber(
                percentage,
                100
              )
            )
          );

        setCanvasZoomValue(
          fabricCanvas,
          safePercentage / 100
        );

        refreshFabricWorkspace(
          fabricCanvas
        );

        return updateZoomState(
          fabricCanvas
        );
      },
      [updateZoomState]
    );

  /*
  |--------------------------------------------------------------------------
  | Reset zoom
  |--------------------------------------------------------------------------
  */

  const resetZoom =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      if (!fabricCanvas) {
        return 100;
      }

      resetCanvasZoom(
        fabricCanvas
      );

      refreshFabricWorkspace(
        fabricCanvas
      );

      return updateZoomState(
        fabricCanvas
      );
    }, [updateZoomState]);

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const deleteSelected =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const removedObjects =
        removeSelectedObjects(
          fabricCanvas
        );

      if (
        removedObjects.length >
        0
      ) {
        clearSelectedObject();

        setDirty(true);

        onCanvasChange?.({
          canvas:
            fabricCanvas,

          action: "delete",

          objects:
            removedObjects,
        });
      }

      return removedObjects;
    }, [
      clearSelectedObject,
      setDirty,
      onCanvasChange,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Duplicate
  |--------------------------------------------------------------------------
  */

  const duplicateSelected =
    useCallback(async () => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const clonedObject =
        await duplicateSelectedObject(
          fabricCanvas
        );

      if (clonedObject) {
        setSelectedObject(
          clonedObject
        );

        setDirty(true);

        onCanvasChange?.({
          canvas:
            fabricCanvas,

          action:
            "duplicate",

          object:
            clonedObject,
        });
      }

      return clonedObject;
    }, [
      setSelectedObject,
      setDirty,
      onCanvasChange,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Copy
  |--------------------------------------------------------------------------
  */

  const copySelected =
    useCallback(async () => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const activeObject =
        fabricCanvas
          ?.getActiveObject?.();

      if (!activeObject) {
        return null;
      }

      clipboardRef.current =
        await activeObject.clone();

      return clipboardRef.current;
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Paste
  |--------------------------------------------------------------------------
  */

  const pasteClipboard =
    useCallback(async () => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const clipboard =
        clipboardRef.current;

      if (
        !fabricCanvas ||
        !clipboard
      ) {
        return null;
      }

      const clonedObject =
        await clipboard.clone();

      clonedObject.set({
        left:
          toSafeNumber(
            clipboard.left,
            0
          ) + 30,

        top:
          toSafeNumber(
            clipboard.top,
            0
          ) + 30,

        evented: true,
        selectable: true,
      });

      clipboardRef.current.set({
        left:
          toSafeNumber(
            clipboard.left,
            0
          ) + 30,

        top:
          toSafeNumber(
            clipboard.top,
            0
          ) + 30,
      });

      fabricCanvas
        .discardActiveObject();

      if (
        clonedObject.type ===
          "activeselection" &&
        Array.isArray(
          clonedObject._objects
        )
      ) {
        clonedObject.canvas =
          fabricCanvas;

        clonedObject.forEachObject(
          (object) => {
            fabricCanvas.add(
              object
            );
          }
        );

        clonedObject.setCoords();

        fabricCanvas.setActiveObject(
          clonedObject
        );
      } else {
        fabricCanvas.add(
          clonedObject
        );

        fabricCanvas.setActiveObject(
          clonedObject
        );
      }

      fabricCanvas
        .requestRenderAll();

      setSelectedObject(
        clonedObject
      );

      setDirty(true);

      onCanvasChange?.({
        canvas:
          fabricCanvas,

        action: "paste",

        object:
          clonedObject,
      });

      return clonedObject;
    }, [
      setSelectedObject,
      setDirty,
      onCanvasChange,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Select all
  |--------------------------------------------------------------------------
  */

  const selectAll =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const selection =
        selectAllObjects(
          fabricCanvas
        );

      if (selection) {
        setSelectedObject(
          selection
        );
      }

      return selection;
    }, [setSelectedObject]);

  /*
  |--------------------------------------------------------------------------
  | Layer movement
  |--------------------------------------------------------------------------
  */

  const moveSelectedForward =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const activeObject =
        fabricCanvas
          ?.getActiveObject?.();

      if (
        !fabricCanvas ||
        !activeObject
      ) {
        return;
      }

      fabricCanvas
        .bringObjectForward(
          activeObject
        );

      fabricCanvas
        .requestRenderAll();

      setDirty(true);
    }, [setDirty]);

  const moveSelectedBackward =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const activeObject =
        fabricCanvas
          ?.getActiveObject?.();

      if (
        !fabricCanvas ||
        !activeObject
      ) {
        return;
      }

      fabricCanvas
        .sendObjectBackwards(
          activeObject
        );

      fabricCanvas
        .requestRenderAll();

      setDirty(true);
    }, [setDirty]);

  const bringSelectedToFront =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const activeObject =
        fabricCanvas
          ?.getActiveObject?.();

      if (
        !fabricCanvas ||
        !activeObject
      ) {
        return;
      }

      fabricCanvas
        .bringObjectToFront(
          activeObject
        );

      fabricCanvas
        .requestRenderAll();

      setDirty(true);
    }, [setDirty]);

  const sendSelectedToBack =
    useCallback(() => {
      const fabricCanvas =
        canvasInstanceRef.current;

      const activeObject =
        fabricCanvas
          ?.getActiveObject?.();

      if (
        !fabricCanvas ||
        !activeObject
      ) {
        return;
      }

      fabricCanvas
        .sendObjectToBack(
          activeObject
        );

      fabricCanvas
        .requestRenderAll();

      setDirty(true);
    }, [setDirty]);

  /*
  |--------------------------------------------------------------------------
  | Save callback
  |--------------------------------------------------------------------------
  */

  const saveCanvas =
    useCallback(async () => {
      const fabricCanvas =
        canvasInstanceRef.current;

      if (
        !fabricCanvas ||
        typeof onSave !==
          "function"
      ) {
        return null;
      }

      return onSave({
        canvas:
          fabricCanvas,

        canvasJson:
          fabricCanvas.toJSON(),

        thumbnail:
          fabricCanvas.toDataURL({
            format: "png",
            quality: 0.8,
            multiplier: 0.2,
          }),
      });
    }, [onSave]);

    /*
|--------------------------------------------------------------------------
| Text API
|--------------------------------------------------------------------------
|
| These methods expose the textEngine helpers to the editor.
| The actual toolbar UI will call these methods later.
|
*/

/*
|--------------------------------------------------------------------------
| Add heading
|--------------------------------------------------------------------------
*/

const addHeading = useCallback(
  (options = {}) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    if (!fabricCanvas) {
      setEditorError(
        "The poster canvas is not ready."
      );

      return null;
    }

    const object =
      addHeadingText(
        fabricCanvas,
        options
      );

    if (!object) {
      setEditorError(
        "Unable to add heading text."
      );

      return null;
    }

    setSelectedObject(object);
    setDirty(true);
    setEditorError("");

    fabricCanvas.setActiveObject(
      object
    );

    object.setCoords();

    fabricCanvas.requestRenderAll();

    onCanvasChange?.({
      action: "text-added",
      canvas: fabricCanvas,
      object,
    });

    return object;
  },
  [
    setSelectedObject,
    setDirty,
    setEditorError,
    onCanvasChange,
  ]
);

/*
|--------------------------------------------------------------------------
| Add subheading
|--------------------------------------------------------------------------
*/

const addSubHeading = useCallback(
  (options = {}) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    if (!fabricCanvas) {
      setEditorError(
        "The poster canvas is not ready."
      );

      return null;
    }

    const object =
      addSubheadingText(
        fabricCanvas,
        options
      );

    if (!object) {
      setEditorError(
        "Unable to add subheading text."
      );

      return null;
    }

    setSelectedObject(object);
    setDirty(true);
    setEditorError("");

    fabricCanvas.setActiveObject(
      object
    );

    object.setCoords();

    fabricCanvas.requestRenderAll();

    onCanvasChange?.({
      action: "text-added",
      canvas: fabricCanvas,
      object,
    });

    return object;
  },
  [
    setSelectedObject,
    setDirty,
    setEditorError,
    onCanvasChange,
  ]
);

/*
|--------------------------------------------------------------------------
| Add body text
|--------------------------------------------------------------------------
*/

const addBody = useCallback(
  (options = {}) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    if (!fabricCanvas) {
      setEditorError(
        "The poster canvas is not ready."
      );

      return null;
    }

    const object =
      addBodyText(
        fabricCanvas,
        options
      );

    if (!object) {
      setEditorError(
        "Unable to add body text."
      );

      return null;
    }

    setSelectedObject(object);
    setDirty(true);
    setEditorError("");

    fabricCanvas.setActiveObject(
      object
    );

    object.setCoords();

    fabricCanvas.requestRenderAll();

    onCanvasChange?.({
      action: "text-added",
      canvas: fabricCanvas,
      object,
    });

    return object;
  },
  [
    setSelectedObject,
    setDirty,
    setEditorError,
    onCanvasChange,
  ]
);
const changeText = useCallback(
  (updates) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    if (!fabricCanvas) {
      return;
    }

    const object = updateActiveText(
      fabricCanvas,
      updates
    );

    if (!object) {
      return;
    }

    setSelectedObject(object);

    setDirty(true);

    onCanvasChange?.({
      action: "text-updated",
      canvas: fabricCanvas,
      object,
    });
  },
  [
    setSelectedObject,
    setDirty,
    onCanvasChange,
  ]
);

const setText = useCallback(
  (value) =>
    changeText({
      text: value,
    }),
  [changeText]
);

const setFont = useCallback(
  (fontFamily) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    setTextFontFamily(
      fabricCanvas,
      fontFamily
    );

    setDirty(true);
  },
  [setDirty]
);

const setFontSize = useCallback(
  (fontSize) => {
    const fabricCanvas =
      canvasInstanceRef.current;

    setTextFontSize(
      fabricCanvas,
      fontSize
    );

    setDirty(true);
  },
  [setDirty]
);

const setFillColor =
  useCallback(
    (color) => {
      const fabricCanvas =
        canvasInstanceRef.current;

      setTextColor(
        fabricCanvas,
        color
      );

      setDirty(true);
    },
    [setDirty]
  );

const setAlignment =
  useCallback(
    (alignment) => {
      const fabricCanvas =
        canvasInstanceRef.current;

      setTextAlignment(
        fabricCanvas,
        alignment
      );

      setDirty(true);
    },
    [setDirty]
  );

const toggleBold =
  useCallback(() => {
    toggleTextBold(
      canvasInstanceRef.current
    );

    setDirty(true);
  }, [setDirty]);

const toggleItalic =
  useCallback(() => {
    toggleTextItalic(
      canvasInstanceRef.current
    );

    setDirty(true);
  }, [setDirty]);

const toggleUnderline =
  useCallback(() => {
    toggleTextUnderline(
      canvasInstanceRef.current
    );

    setDirty(true);
  }, [setDirty]);

const setLetterSpacing =
  useCallback(
    (spacing) => {
      setTextLetterSpacing(
        canvasInstanceRef.current,
        spacing
      );

      setDirty(true);
    },
    [setDirty]
  );

const setLineHeight =
  useCallback(
    (height) => {
      setTextLineHeight(
        canvasInstanceRef.current,
        height
      );

      setDirty(true);
    },
    [setDirty]
  );

const addShadow =
  useCallback(
    (shadow) => {
      setTextShadow(
        canvasInstanceRef.current,
        shadow
      );

      setDirty(true);
    },
    [setDirty]
  );

const removeShadow =
  useCallback(() => {
    removeTextShadow(
      canvasInstanceRef.current
    );

    setDirty(true);
  }, [setDirty]);

const addOutline =
  useCallback(
    (outline) => {
      setTextOutline(
        canvasInstanceRef.current,
        outline
      );

      setDirty(true);
    },
    [setDirty]
  );

const removeOutline =
  useCallback(() => {
    removeTextOutline(
      canvasInstanceRef.current
    );

    setDirty(true);
  }, [setDirty]);

const changeCase =
  useCallback(
    (mode) => {
      transformTextCase(
        canvasInstanceRef.current,
        mode
      );

      setDirty(true);
    },
    [setDirty]
  );

const getSelectedText =
  useCallback(() => {
    return getActiveTextObject(
      canvasInstanceRef.current
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Canva-Grade Image & Graphic Operations
  |--------------------------------------------------------------------------
  */

  const addImage = useCallback((url, options = {}) => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || !url) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fImg = new FabricImage(img, {
        left: options.left || fabricCanvas.getWidth() / 2,
        top: options.top || fabricCanvas.getHeight() / 2,
        originX: "center",
        originY: "center",
        cornerColor: "#00C4CC",
        cornerStrokeColor: "#FFFFFF",
        cornerStyle: "circle",
        transparentCorners: false,
        cornerSize: 12,
        borderColor: "#00C4CC",
        borderScaleFactor: 2,
        ...options,
      });

      const maxWidth = options.maxWidth || Math.round(fabricCanvas.getWidth() * 0.7);
      const maxHeight = options.maxHeight || Math.round(fabricCanvas.getHeight() * 0.7);
      if (fImg.width > maxWidth || fImg.height > maxHeight) {
        const scale = Math.min(maxWidth / fImg.width, maxHeight / fImg.height);
        fImg.scale(scale);
      }

      fabricCanvas.add(fImg);
      fabricCanvas.setActiveObject(fImg);
      fabricCanvas.requestRenderAll();
      setDirty(true);
    };
    img.src = url;
  }, [setDirty]);

  const addElement = useCallback((element, options = {}) => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || !element) return;

    if (element.svg) {
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(element.svg)}`;
      const img = new Image();
      img.onload = () => {
        const fImg = new FabricImage(img, {
          left: options.left || fabricCanvas.getWidth() / 2,
          top: options.top || fabricCanvas.getHeight() / 2,
          originX: "center",
          originY: "center",
          cornerColor: "#00C4CC",
          cornerStrokeColor: "#FFFFFF",
          cornerStyle: "circle",
          transparentCorners: false,
          cornerSize: 12,
          borderColor: "#00C4CC",
          ...options,
        });

        const targetSize = options.size || 220;
        const scale = targetSize / Math.max(fImg.width || 100, fImg.height || 100);
        fImg.scale(scale);

        fabricCanvas.add(fImg);
        fabricCanvas.setActiveObject(fImg);
        fabricCanvas.requestRenderAll();
        setDirty(true);
      };
      img.src = dataUrl;
    }
  }, [setDirty]);

  const setCanvasBackground = useCallback((bgOption) => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || !bgOption) return;

    if (typeof bgOption === "string") {
      fabricCanvas.backgroundColor = bgOption;
      fabricCanvas.requestRenderAll();
      setDirty(true);
      return;
    }

    if (bgOption.type === "solid" && bgOption.color) {
      fabricCanvas.backgroundColor = bgOption.color;
      fabricCanvas.requestRenderAll();
      setDirty(true);
    } else if (bgOption.type === "gradient" && bgOption.gradient?.colors) {
      const colors = bgOption.gradient.colors;
      const colorStops = colors.map((c, idx) => ({
        offset: idx / Math.max(1, colors.length - 1),
        color: c,
      }));
      fabricCanvas.backgroundColor = new Gradient({
        type: "linear",
        gradientUnits: "percentage",
        coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
        colorStops,
      });
      fabricCanvas.requestRenderAll();
      setDirty(true);
    } else if (bgOption.type === "image" && bgOption.url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const fImg = new FabricImage(img, {
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
          scaleX: fabricCanvas.getWidth() / img.width,
          scaleY: fabricCanvas.getHeight() / img.height,
          selectable: false,
          evented: false,
        });
        fabricCanvas.backgroundImage = fImg;
        fabricCanvas.requestRenderAll();
        setDirty(true);
      };
      img.src = bgOption.url;
    }
  }, [setDirty]);

  const setOpacity = useCallback((val) => {
    const fabricCanvas = canvasInstanceRef.current;
    const active = fabricCanvas?.getActiveObject();
    if (!active) return;
    active.set("opacity", val);
    fabricCanvas.requestRenderAll();
    setDirty(true);
  }, [setDirty]);

  const flipHorizontal = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    const active = fabricCanvas?.getActiveObject();
    if (!active) return;
    active.set("flipX", !active.flipX);
    fabricCanvas.requestRenderAll();
    setDirty(true);
  }, [setDirty]);

  const flipVertical = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    const active = fabricCanvas?.getActiveObject();
    if (!active) return;
    active.set("flipY", !active.flipY);
    fabricCanvas.requestRenderAll();
    setDirty(true);
  }, [setDirty]);

  const lockSelected = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    const active = fabricCanvas?.getActiveObject();
    if (!active) return;
    active.set({
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      hasControls: false,
    });
    fabricCanvas.requestRenderAll();
    setDirty(true);
  }, [setDirty]);

  const unlockSelected = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    const active = fabricCanvas?.getActiveObject();
    if (!active) return;
    active.set({
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      hasControls: true,
    });
    fabricCanvas.requestRenderAll();
    setDirty(true);
  }, [setDirty]);

  /*
  |--------------------------------------------------------------------------
  | History (Undo / Redo) Engine
  |--------------------------------------------------------------------------
  */

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isHistoryProcessingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveHistory = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || isHistoryProcessingRef.current) return;

    try {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const currentIndex = historyIndexRef.current;
      const history = historyRef.current.slice(0, currentIndex + 1);

      if (history.length > 0 && history[history.length - 1] === json) return;

      history.push(json);
      if (history.length > 35) history.shift();

      historyRef.current = history;
      historyIndexRef.current = history.length - 1;

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch (e) {
      console.warn("History save error:", e);
    }
  }, []);

  const undo = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || historyIndexRef.current <= 0) return;

    isHistoryProcessingRef.current = true;
    historyIndexRef.current -= 1;
    const targetState = historyRef.current[historyIndexRef.current];

    fabricCanvas.loadFromJSON(JSON.parse(targetState)).then(() => {
      fabricCanvas.requestRenderAll();
      isHistoryProcessingRef.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }).catch(() => {
      isHistoryProcessingRef.current = false;
    });
  }, []);

  const redo = useCallback(() => {
    const fabricCanvas = canvasInstanceRef.current;
    if (!fabricCanvas || historyIndexRef.current >= historyRef.current.length - 1) return;

    isHistoryProcessingRef.current = true;
    historyIndexRef.current += 1;
    const targetState = historyRef.current[historyIndexRef.current];

    fabricCanvas.loadFromJSON(JSON.parse(targetState)).then(() => {
      fabricCanvas.requestRenderAll();
      isHistoryProcessingRef.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }).catch(() => {
      isHistoryProcessingRef.current = false;
    });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initialize Fabric once
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const canvasElement =
      canvasElementRef
        ?.current;

    if (
      !canvasElement ||
      initializationRef.current
    ) {
      return undefined;
    }

    initializationRef.current =
      true;

    let cancelled = false;

    const fabricCanvas =
      createFabricWorkspace({
        canvasElement,

        width,
        height,

        backgroundColor,

        preserveObjectStacking:
          true,

        selection: true,
      });

    canvasInstanceRef.current =
      fabricCanvas;

    setCanvasState(
      fabricCanvas
    );

    setCanvas(
      fabricCanvas,
      canvasElement
    );

    setCanvasSize(
      width,
      height
    );

    setEditorError("");

    /*
    |--------------------------------------------------------------------------
    | Canvas events
    |--------------------------------------------------------------------------
    */

    detachCanvasEventsRef.current =
      attachCanvasEvents(
        fabricCanvas,
        {
          onSelectionChange(
            payload
          ) {
            const activeObject =
              payload.selection
                .activeObject;

            if (activeObject) {
              setSelectedObject(
                activeObject
              );
            } else {
              clearSelectedObject();
            }

            onSelectionChange?.(
              payload
            );
          },

          onObjectModified(
            payload
          ) {
            setDirty(true);
            saveHistory();

            onObjectModified?.(
              payload
            );

            onCanvasChange?.({
              ...payload,
              action:
                "object-modified",
            });
          },

          onTextChanged(
            payload
          ) {
            setDirty(true);
            saveHistory();

            onCanvasChange?.({
              ...payload,
              action:
                "text-changed",
            });
          },

          onObjectAdded(
            payload
          ) {
            saveHistory();
            onCanvasChange?.({
              ...payload,
              action:
                "object-added",
            });
          },

          onObjectRemoved(
            payload
          ) {
            saveHistory();
            onCanvasChange?.({
              ...payload,
              action:
                "object-removed",
            });
          },
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Keyboard shortcuts
    |--------------------------------------------------------------------------
    */

    detachKeyboardRef.current =
      attachCanvasKeyboardShortcuts(
        fabricCanvas,
        {
          onDelete:
            deleteSelected,

          onDuplicate:
            duplicateSelected,

          onCopy:
            copySelected,

          onPaste:
            pasteClipboard,

          onSelectAll:
            selectAll,

          onSave:
            saveCanvas,

          onMoveForward:
            moveSelectedForward,

          onMoveBackward:
            moveSelectedBackward,

          onBringToFront:
            bringSelectedToFront,

          onSendToBack:
            sendSelectedToBack,

          onEscape() {
            clearSelectedObject();
          },

          onNudge(payload) {
            nudgeSelectedObject(
              fabricCanvas,
              payload.action,
              payload.distance
            );

            setDirty(true);
          },

          /*
           * Undo and redo are added
           * in the history section.
           */
          onUndo() {},
          onRedo() {},
        }
      );

    setEditorReady(true);

    /*
     * Wait until CSS layout is ready
     * before calculating fit zoom.
     */
    window.requestAnimationFrame(
      () => {
        if (cancelled) {
          return;
        }

        onReadyRef.current?.(
          fabricCanvas
        );

        fitToWorkspace();

        refreshFabricWorkspace(
          fabricCanvas
        );
      }
    );

    return () => {
      cancelled = true;

      detachKeyboardRef
        .current?.();

      detachCanvasEventsRef
        .current?.();

      detachKeyboardRef.current =
        null;

      detachCanvasEventsRef.current =
        null;

      resizeObserverRef
        .current?.disconnect?.();

      resizeObserverRef.current =
        null;

      canvasInstanceRef.current =
        null;

      clearCanvasReference();

      clearSelectedObject();

      setEditorReady(false);

      setCanvasState(null);

      initializationRef.current =
        false;

      disposeFabricWorkspace({
        canvas:
          fabricCanvas,

        canvasElement,
      });
    };
  }, [
    canvasElementRef,

    width,
    height,
    backgroundColor,

    setCanvas,
    clearCanvasReference,
    setCanvasSize,

    setSelectedObject,
    clearSelectedObject,

    setEditorReady,
    setEditorError,
    setDirty,

    deleteSelected,
    duplicateSelected,

    copySelected,
    pasteClipboard,
    selectAll,

    moveSelectedForward,
    moveSelectedBackward,

    bringSelectedToFront,
    sendSelectedToBack,

    saveCanvas,
    fitToWorkspace,

    onSelectionChange,
    onObjectModified,
    onCanvasChange,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Observe workspace size
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const workspace =
      workspaceElementRef
        ?.current;

    if (
      !workspace ||
      typeof ResizeObserver ===
        "undefined"
    ) {
      return undefined;
    }

    const observer =
      new ResizeObserver(() => {
        const fabricCanvas =
          canvasInstanceRef
            .current;

        if (!fabricCanvas) {
          return;
        }

        refreshFabricWorkspace(
          fabricCanvas
        );
      });

    observer.observe(
      workspace
    );

    resizeObserverRef.current =
      observer;

    return () => {
      observer.disconnect();

      if (
        resizeObserverRef.current ===
        observer
      ) {
        resizeObserverRef.current =
          null;
      }
    };
  }, [workspaceElementRef]);

  /*
  |--------------------------------------------------------------------------
  | Public API
  |--------------------------------------------------------------------------
  */

 return {
  /*
  |--------------------------------------------------------------------------
  | Canvas
  |--------------------------------------------------------------------------
  */

  canvas,

  canvasRef: canvasInstanceRef,

  ready: Boolean(canvas),

  /*
  |--------------------------------------------------------------------------
  | Zoom
  |--------------------------------------------------------------------------
  */

  zoom,

  zoomIn,
  zoomOut,

  setZoom: setCustomZoom,

  fitToWorkspace,
  resetZoom,

  /*
  |--------------------------------------------------------------------------
  | Selection
  |--------------------------------------------------------------------------
  */

  deleteSelected,

  duplicateSelected,

  copySelected,

  pasteClipboard,

  selectAll,

  /*
  |--------------------------------------------------------------------------
  | Layers
  |--------------------------------------------------------------------------
  */

  moveSelectedForward,

  moveSelectedBackward,

  bringSelectedToFront,

  sendSelectedToBack,

  /*
  |--------------------------------------------------------------------------
  | Text
  |--------------------------------------------------------------------------
  */

  addHeading,

  addSubHeading,

  addBody,

  changeText,

  setText,

  setFont,

  setFontSize,

  setFillColor,

  setAlignment,

  toggleBold,

  toggleItalic,

  toggleUnderline,

  setLetterSpacing,

  setLineHeight,

  addShadow,

  removeShadow,

  addOutline,

  removeOutline,

  changeCase,

  getSelectedText,

  /*
  |--------------------------------------------------------------------------
  | Canva-Grade Media & Graphics
  |--------------------------------------------------------------------------
  */

  addImage,
  addElement,
  setBackground: setCanvasBackground,
  setOpacity,
  flipHorizontal,
  flipVertical,
  lockSelected,
  unlockSelected,

  /*
  |--------------------------------------------------------------------------
  | History (Undo / Redo)
  |--------------------------------------------------------------------------
  */

  undo,
  redo,
  canUndo,
  canRedo,

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  saveCanvas,

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  refreshCanvas() {
    refreshFabricWorkspace(
      canvasInstanceRef.current
    );
  },
};
}

export default useFabricCanvas;