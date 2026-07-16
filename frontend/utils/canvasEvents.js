/*
|--------------------------------------------------------------------------
| Fabric Canvas Events
|--------------------------------------------------------------------------
|
| This file contains only the core Fabric event system.
|
| It does not directly use:
|
| - React
| - Zustand
| - templates
| - history
| - API services
| - AI
|
| The React hook will provide callback functions later.
|
*/

/*
|--------------------------------------------------------------------------
| Supported editor events
|--------------------------------------------------------------------------
*/

export const CANVAS_EVENT_NAMES = {
  selectionCreated:
    "selection:created",

  selectionUpdated:
    "selection:updated",

  selectionCleared:
    "selection:cleared",

  objectAdded:
    "object:added",

  objectRemoved:
    "object:removed",

  objectMoving:
    "object:moving",

  objectScaling:
    "object:scaling",

  objectRotating:
    "object:rotating",

  objectModified:
    "object:modified",

  textChanged:
    "text:changed",

  mouseDown:
    "mouse:down",

  mouseMove:
    "mouse:move",

  mouseUp:
    "mouse:up",

  mouseDoubleClick:
    "mouse:dblclick",
};

/*
|--------------------------------------------------------------------------
| Safe callback execution
|--------------------------------------------------------------------------
*/

function callSafely(
  callback,
  payload
) {
  if (
    typeof callback !==
    "function"
  ) {
    return;
  }

  try {
    callback(payload);
  } catch (error) {
    console.error(
      "SmartWish canvas event callback failed:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| Safe array helper
|--------------------------------------------------------------------------
*/

function toSafeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

/*
|--------------------------------------------------------------------------
| Active selection information
|--------------------------------------------------------------------------
*/

export function getCanvasSelection(
  canvas
) {
  if (!canvas) {
    return {
      activeObject: null,
      activeObjects: [],
      selectionCount: 0,
      hasSelection: false,
      isMultipleSelection: false,
    };
  }

  const activeObject =
    canvas.getActiveObject?.() ||
    null;

  const activeObjects =
    toSafeArray(
      canvas.getActiveObjects?.()
    );

  return {
    activeObject,

    activeObjects,

    selectionCount:
      activeObjects.length,

    hasSelection:
      Boolean(activeObject),

    isMultipleSelection:
      activeObjects.length > 1,
  };
}

/*
|--------------------------------------------------------------------------
| Pointer information
|--------------------------------------------------------------------------
*/

export function getCanvasPointerInfo(
  eventData
) {
  const nativeEvent =
    eventData?.e || null;

  const scenePoint =
    eventData?.scenePoint ||
    null;

  const viewportPoint =
    eventData?.viewportPoint ||
    null;

  return {
    nativeEvent,

    scenePoint,

    viewportPoint,

    clientX:
      Number(
        nativeEvent?.clientX
      ) || 0,

    clientY:
      Number(
        nativeEvent?.clientY
      ) || 0,

    button:
      Number(
        nativeEvent?.button
      ) || 0,

    altKey:
      Boolean(
        nativeEvent?.altKey
      ),

    ctrlKey:
      Boolean(
        nativeEvent?.ctrlKey
      ),

    metaKey:
      Boolean(
        nativeEvent?.metaKey
      ),

    shiftKey:
      Boolean(
        nativeEvent?.shiftKey
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Object information
|--------------------------------------------------------------------------
*/

export function getCanvasObjectInfo(
  object
) {
  if (!object) {
    return null;
  }

  const scaledWidth =
    typeof object.getScaledWidth ===
    "function"
      ? object.getScaledWidth()
      : Number(object.width) *
        Number(
          object.scaleX || 1
        );

  const scaledHeight =
    typeof object.getScaledHeight ===
    "function"
      ? object.getScaledHeight()
      : Number(object.height) *
        Number(
          object.scaleY || 1
        );

  return {
    object,

    id:
      object.editorId ||
      object.id ||
      null,

    name:
      object.editorName ||
      object.name ||
      object.type ||
      "Object",

    type:
      object.editorType ||
      object.type ||
      "object",

    left:
      Number(object.left) || 0,

    top:
      Number(object.top) || 0,

    width:
      Number(scaledWidth) || 0,

    height:
      Number(scaledHeight) || 0,

    angle:
      Number(object.angle) || 0,

    scaleX:
      Number(object.scaleX) || 1,

    scaleY:
      Number(object.scaleY) || 1,

    opacity:
      Number.isFinite(
        Number(object.opacity)
      )
        ? Number(object.opacity)
        : 1,

    selectable:
      object.selectable !==
      false,

    evented:
      object.evented !==
      false,

    locked:
      Boolean(object.locked),

    visible:
      object.visible !== false,
  };
}

/*
|--------------------------------------------------------------------------
| Event payload builder
|--------------------------------------------------------------------------
*/

function createEventPayload({
  canvas,
  eventName,
  eventData,
  target,
} = {}) {
  const resolvedTarget =
    target ||
    eventData?.target ||
    canvas?.getActiveObject?.() ||
    null;

  return {
    canvas,

    eventName,

    eventData:
      eventData || null,

    target:
      resolvedTarget,

    targetInfo:
      getCanvasObjectInfo(
        resolvedTarget
      ),

    selection:
      getCanvasSelection(
        canvas
      ),

    pointer:
      getCanvasPointerInfo(
        eventData
      ),

    timestamp:
      Date.now(),
  };
}

/*
|--------------------------------------------------------------------------
| Attach core canvas events
|--------------------------------------------------------------------------
|
| Each callback is optional.
|
| Example:
|
| attachCanvasEvents(canvas, {
|   onSelectionChange(payload) {},
|   onObjectModified(payload) {},
| });
|
*/

export function attachCanvasEvents(
  canvas,
  {
    onSelectionCreated,
    onSelectionUpdated,
    onSelectionCleared,
    onSelectionChange,

    onObjectAdded,
    onObjectRemoved,

    onObjectMoving,
    onObjectScaling,
    onObjectRotating,
    onObjectTransforming,
    onObjectModified,

    onTextChanged,

    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseDoubleClick,

    onAnyEvent,
  } = {}
) {
  if (!canvas) {
    throw new Error(
      "A Fabric canvas instance is required to attach canvas events."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Selection created
  |--------------------------------------------------------------------------
  */

  const handleSelectionCreated =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .selectionCreated,
          eventData,
        });

      callSafely(
        onSelectionCreated,
        payload
      );

      callSafely(
        onSelectionChange,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Selection updated
  |--------------------------------------------------------------------------
  */

  const handleSelectionUpdated =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .selectionUpdated,
          eventData,
        });

      callSafely(
        onSelectionUpdated,
        payload
      );

      callSafely(
        onSelectionChange,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Selection cleared
  |--------------------------------------------------------------------------
  */

  const handleSelectionCleared =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .selectionCleared,
          eventData,
          target: null,
        });

      callSafely(
        onSelectionCleared,
        payload
      );

      callSafely(
        onSelectionChange,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object added
  |--------------------------------------------------------------------------
  */

  const handleObjectAdded =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectAdded,
          eventData,
        });

      callSafely(
        onObjectAdded,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object removed
  |--------------------------------------------------------------------------
  */

  const handleObjectRemoved =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectRemoved,
          eventData,
        });

      callSafely(
        onObjectRemoved,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object moving
  |--------------------------------------------------------------------------
  */

  const handleObjectMoving =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectMoving,
          eventData,
        });

      callSafely(
        onObjectMoving,
        payload
      );

      callSafely(
        onObjectTransforming,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object scaling
  |--------------------------------------------------------------------------
  */

  const handleObjectScaling =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectScaling,
          eventData,
        });

      callSafely(
        onObjectScaling,
        payload
      );

      callSafely(
        onObjectTransforming,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object rotating
  |--------------------------------------------------------------------------
  */

  const handleObjectRotating =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectRotating,
          eventData,
        });

      callSafely(
        onObjectRotating,
        payload
      );

      callSafely(
        onObjectTransforming,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Object modified
  |--------------------------------------------------------------------------
  */

  const handleObjectModified =
    (eventData) => {
      const target =
        eventData?.target ||
        null;

      target?.setCoords?.();

      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .objectModified,
          eventData,
          target,
        });

      callSafely(
        onObjectModified,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Text changed
  |--------------------------------------------------------------------------
  */

  const handleTextChanged =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .textChanged,
          eventData,
        });

      callSafely(
        onTextChanged,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Mouse down
  |--------------------------------------------------------------------------
  */

  const handleMouseDown =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .mouseDown,
          eventData,
        });

      callSafely(
        onMouseDown,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Mouse move
  |--------------------------------------------------------------------------
  */

  const handleMouseMove =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .mouseMove,
          eventData,
        });

      callSafely(
        onMouseMove,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Mouse up
  |--------------------------------------------------------------------------
  */

  const handleMouseUp =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .mouseUp,
          eventData,
        });

      callSafely(
        onMouseUp,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Mouse double-click
  |--------------------------------------------------------------------------
  */

  const handleMouseDoubleClick =
    (eventData) => {
      const payload =
        createEventPayload({
          canvas,
          eventName:
            CANVAS_EVENT_NAMES
              .mouseDoubleClick,
          eventData,
        });

      callSafely(
        onMouseDoubleClick,
        payload
      );

      callSafely(
        onAnyEvent,
        payload
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Register events
  |--------------------------------------------------------------------------
  */

  canvas.on(
    CANVAS_EVENT_NAMES
      .selectionCreated,
    handleSelectionCreated
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .selectionUpdated,
    handleSelectionUpdated
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .selectionCleared,
    handleSelectionCleared
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectAdded,
    handleObjectAdded
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectRemoved,
    handleObjectRemoved
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectMoving,
    handleObjectMoving
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectScaling,
    handleObjectScaling
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectRotating,
    handleObjectRotating
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .objectModified,
    handleObjectModified
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .textChanged,
    handleTextChanged
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .mouseDown,
    handleMouseDown
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .mouseMove,
    handleMouseMove
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .mouseUp,
    handleMouseUp
  );

  canvas.on(
    CANVAS_EVENT_NAMES
      .mouseDoubleClick,
    handleMouseDoubleClick
  );

  /*
  |--------------------------------------------------------------------------
  | Cleanup function
  |--------------------------------------------------------------------------
  |
  | Call the returned function when React unmounts or when
  | the canvas instance changes.
  |
  */

  return function detachCanvasEvents() {
    canvas.off(
      CANVAS_EVENT_NAMES
        .selectionCreated,
      handleSelectionCreated
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .selectionUpdated,
      handleSelectionUpdated
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .selectionCleared,
      handleSelectionCleared
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectAdded,
      handleObjectAdded
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectRemoved,
      handleObjectRemoved
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectMoving,
      handleObjectMoving
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectScaling,
      handleObjectScaling
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectRotating,
      handleObjectRotating
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .objectModified,
      handleObjectModified
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .textChanged,
      handleTextChanged
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .mouseDown,
      handleMouseDown
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .mouseMove,
      handleMouseMove
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .mouseUp,
      handleMouseUp
    );

    canvas.off(
      CANVAS_EVENT_NAMES
        .mouseDoubleClick,
      handleMouseDoubleClick
    );
  };
}

/*
|--------------------------------------------------------------------------
| Detach every event from a canvas
|--------------------------------------------------------------------------
|
| Prefer the cleanup function returned by attachCanvasEvents().
|
| This utility is mainly useful during full workspace destruction.
|
*/

export function removeAllCanvasEvents(
  canvas
) {
  if (!canvas) {
    return;
  }

  canvas.off();
}
/*
|--------------------------------------------------------------------------
| Canvas keyboard shortcuts
|--------------------------------------------------------------------------
|
| This section handles keyboard input only.
|
| It does not directly perform:
|
| - undo or redo;
| - copy or paste;
| - save;
| - duplication;
| - layer changes;
|
| Instead, it calls callback functions supplied later by
| useFabricCanvas.js.
|
*/

/*
|--------------------------------------------------------------------------
| Keyboard action names
|--------------------------------------------------------------------------
*/

export const CANVAS_KEYBOARD_ACTIONS = {
  delete: "delete",
  undo: "undo",
  redo: "redo",
  duplicate: "duplicate",
  copy: "copy",
  paste: "paste",
  selectAll: "select-all",
  save: "save",
  escape: "escape",
  moveForward: "move-forward",
  moveBackward: "move-backward",
  bringToFront: "bring-to-front",
  sendToBack: "send-to-back",
  nudgeUp: "nudge-up",
  nudgeDown: "nudge-down",
  nudgeLeft: "nudge-left",
  nudgeRight: "nudge-right",
  group: "group",
  ungroup: "ungroup",
};

/*
|--------------------------------------------------------------------------
| Default keyboard options
|--------------------------------------------------------------------------
*/

export const DEFAULT_KEYBOARD_OPTIONS = {
  enabled: true,

  /*
   * Normal arrow-key movement.
   */
  nudgeDistance: 1,

  /*
   * Shift + arrow-key movement.
   */
  largeNudgeDistance: 10,

  /*
   * Prevent browser defaults for handled editor shortcuts.
   */
  preventDefault: true,

  /*
   * Ignore shortcuts while typing in regular form controls.
   */
  ignoreEditableElements: true,

  /*
   * Ignore most shortcuts while editing Fabric text.
   */
  ignoreWhileEditingText: true,
};

/*
|--------------------------------------------------------------------------
| Check whether an HTML target is editable
|--------------------------------------------------------------------------
*/

export function isEditableKeyboardTarget(
  target
) {
  if (!target) {
    return false;
  }

  const tagName =
    String(
      target.tagName || ""
    ).toLowerCase();

  if (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  ) {
    return true;
  }

  if (
    target.isContentEditable
  ) {
    return true;
  }

  /*
   * Support custom editors that use
   * contenteditable on a parent element.
   */
  if (
    typeof target.closest ===
    "function"
  ) {
    const editableParent =
      target.closest(
        "[contenteditable='true']"
      );

    if (editableParent) {
      return true;
    }
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| Check whether Fabric text is currently being edited
|--------------------------------------------------------------------------
*/

export function isFabricTextEditing(
  canvas
) {
  if (!canvas) {
    return false;
  }

  const activeObject =
    canvas.getActiveObject?.();

  if (!activeObject) {
    return false;
  }

  return Boolean(
    activeObject.isEditing
  );
}

/*
|--------------------------------------------------------------------------
| Modifier-key information
|--------------------------------------------------------------------------
*/

function getKeyboardModifiers(
  keyboardEvent
) {
  return {
    ctrlKey:
      Boolean(
        keyboardEvent?.ctrlKey
      ),

    metaKey:
      Boolean(
        keyboardEvent?.metaKey
      ),

    altKey:
      Boolean(
        keyboardEvent?.altKey
      ),

    shiftKey:
      Boolean(
        keyboardEvent?.shiftKey
      ),

    modifierKey:
      Boolean(
        keyboardEvent?.ctrlKey ||
        keyboardEvent?.metaKey
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Create keyboard payload
|--------------------------------------------------------------------------
*/

function createKeyboardPayload({
  canvas,
  action,
  keyboardEvent,
  distance = 0,
} = {}) {
  return {
    canvas,

    action,

    keyboardEvent:
      keyboardEvent || null,

    key:
      String(
        keyboardEvent?.key || ""
      ),

    code:
      String(
        keyboardEvent?.code || ""
      ),

    distance:
      Number(distance) || 0,

    modifiers:
      getKeyboardModifiers(
        keyboardEvent
      ),

    selection:
      getCanvasSelection(
        canvas
      ),

    timestamp:
      Date.now(),
  };
}

/*
|--------------------------------------------------------------------------
| Prevent browser keyboard behaviour
|--------------------------------------------------------------------------
*/

function preventKeyboardDefault(
  keyboardEvent,
  enabled
) {
  if (!enabled) {
    return;
  }

  keyboardEvent?.preventDefault?.();
  keyboardEvent?.stopPropagation?.();
}

/*
|--------------------------------------------------------------------------
| Safely exit Fabric text editing
|--------------------------------------------------------------------------
*/

function exitFabricTextEditing(
  canvas
) {
  if (!canvas) {
    return false;
  }

  const activeObject =
    canvas.getActiveObject?.();

  if (
    !activeObject ||
    !activeObject.isEditing
  ) {
    return false;
  }

  activeObject.exitEditing?.();

  activeObject.setCoords?.();

  canvas.requestRenderAll?.();

  return true;
}

/*
|--------------------------------------------------------------------------
| Attach keyboard shortcuts
|--------------------------------------------------------------------------
|
| Usage:
|
| const detachKeyboard =
|   attachCanvasKeyboardShortcuts(
|     canvas,
|     {
|       onDelete(payload) {},
|       onUndo(payload) {},
|       onRedo(payload) {},
|       onDuplicate(payload) {},
|     }
|   );
|
| detachKeyboard();
|
*/

export function attachCanvasKeyboardShortcuts(
  canvas,
  {
    enabled =
      DEFAULT_KEYBOARD_OPTIONS.enabled,

    nudgeDistance =
      DEFAULT_KEYBOARD_OPTIONS
        .nudgeDistance,

    largeNudgeDistance =
      DEFAULT_KEYBOARD_OPTIONS
        .largeNudgeDistance,

    preventDefault =
      DEFAULT_KEYBOARD_OPTIONS
        .preventDefault,

    ignoreEditableElements =
      DEFAULT_KEYBOARD_OPTIONS
        .ignoreEditableElements,

    ignoreWhileEditingText =
      DEFAULT_KEYBOARD_OPTIONS
        .ignoreWhileEditingText,

    onDelete,

    onUndo,
    onRedo,

    onDuplicate,

    onCopy,
    onPaste,

    onSelectAll,

    onSave,

    onEscape,

    onMoveForward,
    onMoveBackward,

    onBringToFront,
    onSendToBack,

    onNudge,

    onGroup,
    onUngroup,

    onAnyKeyboardAction,
  } = {}
) {
  if (!canvas) {
    throw new Error(
      "A Fabric canvas instance is required to attach keyboard shortcuts."
    );
  }

  if (!enabled) {
    return function detachDisabledKeyboardShortcuts() {};
  }

  const safeNudgeDistance =
    Number.isFinite(
      Number(nudgeDistance)
    )
      ? Math.max(
          Number(nudgeDistance),
          0
        )
      : 1;

  const safeLargeNudgeDistance =
    Number.isFinite(
      Number(
        largeNudgeDistance
      )
    )
      ? Math.max(
          Number(
            largeNudgeDistance
          ),
          safeNudgeDistance
        )
      : 10;

  /*
  |--------------------------------------------------------------------------
  | Run one keyboard action
  |--------------------------------------------------------------------------
  */

  const runKeyboardAction = ({
    action,
    keyboardEvent,
    callback,
    distance = 0,
  }) => {
    const payload =
      createKeyboardPayload({
        canvas,
        action,
        keyboardEvent,
        distance,
      });

    callSafely(
      callback,
      payload
    );

    callSafely(
      onAnyKeyboardAction,
      payload
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Key-down handler
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = (
    keyboardEvent
  ) => {
    if (!enabled) {
      return;
    }

    const target =
      keyboardEvent.target;

    const isEditableTarget =
      isEditableKeyboardTarget(
        target
      );

    if (
      ignoreEditableElements &&
      isEditableTarget
    ) {
      return;
    }

    const key =
      String(
        keyboardEvent.key || ""
      ).toLowerCase();

    const {
      modifierKey,
      shiftKey,
      altKey,
    } = getKeyboardModifiers(
      keyboardEvent
    );

    const editingFabricText =
      isFabricTextEditing(
        canvas
      );

    /*
    |--------------------------------------------------------------------------
    | Escape
    |--------------------------------------------------------------------------
    |
    | Escape is allowed even while editing text.
    |
    */

    if (
      keyboardEvent.key ===
      "Escape"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      const exitedTextEditing =
        exitFabricTextEditing(
          canvas
        );

      if (
        !exitedTextEditing
      ) {
        canvas.discardActiveObject?.();
        canvas.requestRenderAll?.();
      }

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .escape,

        keyboardEvent,

        callback:
          onEscape,
      });

      return;
    }

    /*
     * Do not run editor shortcuts while the
     * user is typing inside Fabric text.
     */
    if (
      ignoreWhileEditingText &&
      editingFabricText
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete selected objects
    |--------------------------------------------------------------------------
    */

    if (
      keyboardEvent.key ===
        "Delete" ||
      keyboardEvent.key ===
        "Backspace"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .delete,

        keyboardEvent,

        callback:
          onDelete,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Undo
    |--------------------------------------------------------------------------
    |
    | Windows/Linux:
    | Ctrl + Z
    |
    | macOS:
    | Command + Z
    |
    */

    if (
      modifierKey &&
      key === "z" &&
      !shiftKey
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .undo,

        keyboardEvent,

        callback:
          onUndo,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Redo
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + Y
    | Ctrl/Cmd + Shift + Z
    |
    */

    if (
      modifierKey &&
      (
        key === "y" ||
        (
          key === "z" &&
          shiftKey
        )
      )
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .redo,

        keyboardEvent,

        callback:
          onRedo,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    if (
      modifierKey &&
      key === "s"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .save,

        keyboardEvent,

        callback:
          onSave,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Duplicate
    |--------------------------------------------------------------------------
    */

    if (
      modifierKey &&
      key === "d"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .duplicate,

        keyboardEvent,

        callback:
          onDuplicate,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Copy
    |--------------------------------------------------------------------------
    */

    if (
      modifierKey &&
      key === "c"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .copy,

        keyboardEvent,

        callback:
          onCopy,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Paste
    |--------------------------------------------------------------------------
    */

    if (
      modifierKey &&
      key === "v"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .paste,

        keyboardEvent,

        callback:
          onPaste,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Select all
    |--------------------------------------------------------------------------
    */

    if (
      modifierKey &&
      key === "a"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .selectAll,

        keyboardEvent,

        callback:
          onSelectAll,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Layer forward
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + ]
    |
    */

    if (
      modifierKey &&
      keyboardEvent.key === "]" &&
      !shiftKey
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .moveForward,

        keyboardEvent,

        callback:
          onMoveForward,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Layer backward
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + [
    |
    */

    if (
      modifierKey &&
      keyboardEvent.key === "[" &&
      !shiftKey
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .moveBackward,

        keyboardEvent,

        callback:
          onMoveBackward,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Bring to front
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + Shift + ]
    |
    */

    if (
      modifierKey &&
      shiftKey &&
      keyboardEvent.key === "]"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .bringToFront,

        keyboardEvent,

        callback:
          onBringToFront,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Send to back
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + Shift + [
    |
    */

    if (
      modifierKey &&
      shiftKey &&
      keyboardEvent.key === "["
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .sendToBack,

        keyboardEvent,

        callback:
          onSendToBack,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Group
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + G
    |
    */

    if (
      modifierKey &&
      key === "g" &&
      !shiftKey
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .group,

        keyboardEvent,

        callback:
          onGroup,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Ungroup
    |--------------------------------------------------------------------------
    |
    | Ctrl/Cmd + Shift + G
    |
    */

    if (
      modifierKey &&
      key === "g" &&
      shiftKey
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .ungroup,

        keyboardEvent,

        callback:
          onUngroup,
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Arrow-key nudging
    |--------------------------------------------------------------------------
    */

    const activeObject =
      canvas.getActiveObject?.();

    if (!activeObject) {
      return;
    }

    const nudgeAmount =
      shiftKey
        ? safeLargeNudgeDistance
        : safeNudgeDistance;

    /*
     * Alt is reserved for future
     * duplication-drag behaviour.
     */
    if (altKey) {
      return;
    }

    if (
      keyboardEvent.key ===
      "ArrowUp"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .nudgeUp,

        keyboardEvent,

        callback:
          onNudge,

        distance:
          -nudgeAmount,
      });

      return;
    }

    if (
      keyboardEvent.key ===
      "ArrowDown"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .nudgeDown,

        keyboardEvent,

        callback:
          onNudge,

        distance:
          nudgeAmount,
      });

      return;
    }

    if (
      keyboardEvent.key ===
      "ArrowLeft"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .nudgeLeft,

        keyboardEvent,

        callback:
          onNudge,

        distance:
          -nudgeAmount,
      });

      return;
    }

    if (
      keyboardEvent.key ===
      "ArrowRight"
    ) {
      preventKeyboardDefault(
        keyboardEvent,
        preventDefault
      );

      runKeyboardAction({
        action:
          CANVAS_KEYBOARD_ACTIONS
            .nudgeRight,

        keyboardEvent,

        callback:
          onNudge,

        distance:
          nudgeAmount,
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Register keyboard listener
  |--------------------------------------------------------------------------
  */

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  return function detachCanvasKeyboardShortcuts() {
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );
  };
}