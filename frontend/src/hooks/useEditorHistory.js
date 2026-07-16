import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import useEditorStore from "../components/store/editorStore";

/*
|--------------------------------------------------------------------------
| Fabric custom properties
|--------------------------------------------------------------------------
|
| These custom values must be included whenever the canvas is serialized.
|
*/

const CUSTOM_OBJECT_PROPERTIES = [
  "editorId",
  "editorType",
  "editorName",
  "locked",
  "dynamicField",
  "assetId",
  "assetType",
  "excludeFromExport",
];

/*
|--------------------------------------------------------------------------
| Safe JSON parser
|--------------------------------------------------------------------------
*/

function parseSnapshot(snapshot) {
  if (!snapshot) {
    return null;
  }

  if (typeof snapshot === "object") {
    return snapshot;
  }

  try {
    return JSON.parse(snapshot);
  } catch (error) {
    console.error(
      "Unable to parse editor history snapshot:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Create a full editor snapshot
|--------------------------------------------------------------------------
|
| Fabric canvas JSON does not include the logical canvas dimensions.
| We save width and height separately.
|
*/

function createCanvasSnapshot(canvas) {
  if (!canvas) {
    return null;
  }

  const snapshot = {
    version: 1,

    width: canvas.getWidth(),
    height: canvas.getHeight(),

    backgroundColor:
      canvas.backgroundColor || null,

    canvas: canvas.toJSON(
      CUSTOM_OBJECT_PROPERTIES
    ),
  };

  return JSON.stringify(snapshot);
}

/*
|--------------------------------------------------------------------------
| Compare snapshots
|--------------------------------------------------------------------------
*/

function snapshotsAreEqual(
  firstSnapshot,
  secondSnapshot
) {
  if (!firstSnapshot || !secondSnapshot) {
    return false;
  }

  return firstSnapshot === secondSnapshot;
}

/*
|--------------------------------------------------------------------------
| Restore one snapshot
|--------------------------------------------------------------------------
*/

async function restoreCanvasSnapshot(
  canvas,
  snapshot
) {
  const parsedSnapshot =
    parseSnapshot(snapshot);

  if (!canvas || !parsedSnapshot) {
    return false;
  }

  /*
   * Support both:
   *
   * 1. New wrapped history format
   * 2. Old raw Fabric JSON format
   */
  const canvasJson =
    parsedSnapshot.canvas ||
    parsedSnapshot;

  const width =
    Number(parsedSnapshot.width) ||
    Number(canvasJson.width) ||
    canvas.getWidth();

  const height =
    Number(parsedSnapshot.height) ||
    Number(canvasJson.height) ||
    canvas.getHeight();

  canvas.discardActiveObject();

  await canvas.loadFromJSON(canvasJson);

  canvas.setDimensions({
    width,
    height,
  });

  canvas.getObjects().forEach(
    (object) => {
      object.setCoords();
    }
  );

  canvas.requestRenderAll();

  return true;
}

/*
|--------------------------------------------------------------------------
| Editor history hook
|--------------------------------------------------------------------------
*/

function useEditorHistory(canvas) {
  const {
    history,
    historyProcessing,

    setHistory,
    clearHistory,
    setHistoryProcessing,

    setSelectedObject,
    setDirty,
  } = useEditorStore();

  /*
   * Prevent rapidly repeated Fabric events from creating
   * many identical history entries.
   */
  const saveTimeoutRef =
    useRef(null);

  const lastSnapshotRef =
    useRef(null);

  const initializedRef =
    useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Clear pending timer
  |--------------------------------------------------------------------------
  */

  const clearPendingSave =
    useCallback(() => {
      if (
        saveTimeoutRef.current
      ) {
        clearTimeout(
          saveTimeoutRef.current
        );

        saveTimeoutRef.current =
          null;
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Capture current canvas immediately
  |--------------------------------------------------------------------------
  */

  const captureSnapshot =
    useCallback(() => {
      if (
        !canvas ||
        historyProcessing
      ) {
        return null;
      }

      return createCanvasSnapshot(
        canvas
      );
    }, [
      canvas,
      historyProcessing,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Push current canvas into history
  |--------------------------------------------------------------------------
  */

  const saveHistory =
    useCallback(
      ({
        immediate = false,
        markDirty = true,
      } = {}) => {
        if (
          !canvas ||
          historyProcessing
        ) {
          return;
        }

        clearPendingSave();

        const commitSnapshot = () => {
          const snapshot =
            createCanvasSnapshot(
              canvas
            );

          if (!snapshot) {
            return;
          }

          if (
            snapshotsAreEqual(
              snapshot,
              lastSnapshotRef.current
            )
          ) {
            return;
          }

          const currentHistory =
            useEditorStore.getState()
              .history;

          const nextUndoStack = [
            ...currentHistory
              .undoStack,
            snapshot,
          ].slice(-50);

          setHistory(
            nextUndoStack,
            []
          );

          lastSnapshotRef.current =
            snapshot;

          if (markDirty) {
            setDirty(true);
          }
        };

        if (immediate) {
          commitSnapshot();
          return;
        }

        saveTimeoutRef.current =
          setTimeout(
            commitSnapshot,
            180
          );
      },
      [
        canvas,
        historyProcessing,
        clearPendingSave,
        setHistory,
        setDirty,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Initialize history with the loaded design
  |--------------------------------------------------------------------------
  */

  const initializeHistory =
    useCallback(() => {
      if (!canvas) {
        return;
      }

      clearPendingSave();

      const initialSnapshot =
        createCanvasSnapshot(
          canvas
        );

      if (!initialSnapshot) {
        return;
      }

      setHistory(
        [initialSnapshot],
        []
      );

      lastSnapshotRef.current =
        initialSnapshot;

      initializedRef.current =
        true;

      setDirty(false);
    }, [
      canvas,
      clearPendingSave,
      setHistory,
      setDirty,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Undo
  |--------------------------------------------------------------------------
  */

  const undo =
    useCallback(async () => {
      if (
        !canvas ||
        historyProcessing
      ) {
        return false;
      }

      clearPendingSave();

      const currentHistory =
        useEditorStore.getState()
          .history;

      const undoStack =
        currentHistory.undoStack;

      /*
       * The first item is the original canvas state,
       * so at least two entries are needed for undo.
       */
      if (undoStack.length <= 1) {
        return false;
      }

      const currentSnapshot =
        undoStack[
          undoStack.length - 1
        ];

      const previousSnapshot =
        undoStack[
          undoStack.length - 2
        ];

      const nextUndoStack =
        undoStack.slice(0, -1);

      const nextRedoStack = [
        ...currentHistory
          .redoStack,
        currentSnapshot,
      ].slice(-50);

      setHistoryProcessing(true);

      try {
        canvas.discardActiveObject();

        setSelectedObject(null);

        await restoreCanvasSnapshot(
          canvas,
          previousSnapshot
        );

        setHistory(
          nextUndoStack,
          nextRedoStack
        );

        lastSnapshotRef.current =
          previousSnapshot;

        setDirty(true);

        return true;
      } catch (error) {
        console.error(
          "Undo failed:",
          error
        );

        return false;
      } finally {
        setHistoryProcessing(false);
      }
    }, [
      canvas,
      historyProcessing,
      clearPendingSave,
      setHistory,
      setHistoryProcessing,
      setSelectedObject,
      setDirty,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Redo
  |--------------------------------------------------------------------------
  */

  const redo =
    useCallback(async () => {
      if (
        !canvas ||
        historyProcessing
      ) {
        return false;
      }

      clearPendingSave();

      const currentHistory =
        useEditorStore.getState()
          .history;

      const redoStack =
        currentHistory.redoStack;

      if (redoStack.length === 0) {
        return false;
      }

      const nextSnapshot =
        redoStack[
          redoStack.length - 1
        ];

      const nextRedoStack =
        redoStack.slice(0, -1);

      const nextUndoStack = [
        ...currentHistory
          .undoStack,
        nextSnapshot,
      ].slice(-50);

      setHistoryProcessing(true);

      try {
        canvas.discardActiveObject();

        setSelectedObject(null);

        await restoreCanvasSnapshot(
          canvas,
          nextSnapshot
        );

        setHistory(
          nextUndoStack,
          nextRedoStack
        );

        lastSnapshotRef.current =
          nextSnapshot;

        setDirty(true);

        return true;
      } catch (error) {
        console.error(
          "Redo failed:",
          error
        );

        return false;
      } finally {
        setHistoryProcessing(false);
      }
    }, [
      canvas,
      historyProcessing,
      clearPendingSave,
      setHistory,
      setHistoryProcessing,
      setSelectedObject,
      setDirty,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Reset history
  |--------------------------------------------------------------------------
  */

  const resetHistory =
    useCallback(() => {
      clearPendingSave();

      initializedRef.current =
        false;

      lastSnapshotRef.current =
        null;

      clearHistory();
    }, [
      clearPendingSave,
      clearHistory,
    ]);

  /*
  |--------------------------------------------------------------------------
  | History information
  |--------------------------------------------------------------------------
  */

  const canUndo =
    history.undoStack.length > 1;

  const canRedo =
    history.redoStack.length > 0;

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      clearPendingSave();
    };
  }, [clearPendingSave]);

  return {
    canUndo,
    canRedo,

    undo,
    redo,

    saveHistory,
    initializeHistory,
    resetHistory,
    captureSnapshot,

    restoreSnapshot:
      async (snapshot) => {
        if (!canvas) {
          return false;
        }

        setHistoryProcessing(true);

        try {
          const restored =
            await restoreCanvasSnapshot(
              canvas,
              snapshot
            );

          if (restored) {
            lastSnapshotRef.current =
              typeof snapshot ===
              "string"
                ? snapshot
                : JSON.stringify(
                    snapshot
                  );
          }

          return restored;
        } finally {
          setHistoryProcessing(false);
        }
      },

    historyProcessing,
  };
}

export {
  createCanvasSnapshot,
  restoreCanvasSnapshot,
};

export default useEditorHistory;