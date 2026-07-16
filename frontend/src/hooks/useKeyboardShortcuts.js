import {
  useEffect,
} from "react";

/*
|--------------------------------------------------------------------------
| Editable HTML elements
|--------------------------------------------------------------------------
|
| Keyboard shortcuts should not delete canvas objects while
| the user is typing inside a normal form input.
|
*/

function isEditableElement(element) {
  if (!element) {
    return false;
  }

  const tagName =
    element.tagName?.toLowerCase();

  if (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  ) {
    return true;
  }

  if (
    element.isContentEditable
  ) {
    return true;
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| Fabric text editing detection
|--------------------------------------------------------------------------
*/

function canvasIsEditingText(canvas) {
  const activeObject =
    canvas?.getActiveObject();

  if (!activeObject) {
    return false;
  }

  return Boolean(
    activeObject.isEditing
  );
}

/*
|--------------------------------------------------------------------------
| Keyboard shortcut hook
|--------------------------------------------------------------------------
*/

function useKeyboardShortcuts({
  canvas,

  enabled = true,

  onUndo,
  onRedo,

  onDelete,
  onDuplicate,

  onCopy,
  onPaste,

  onSelectAll,

  onMoveForward,
  onMoveBackward,

  onSave,
  onEscape,
}) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleKeyDown = async (
      event
    ) => {
      const target =
        event.target;

      const editingHtml =
        isEditableElement(
          target
        );

      const editingCanvasText =
        canvasIsEditingText(
          canvas
        );

      const modifierKey =
        event.ctrlKey ||
        event.metaKey;

      const key =
        event.key.toLowerCase();

      /*
      |--------------------------------------------------------------------------
      | Escape
      |--------------------------------------------------------------------------
      */

      if (event.key === "Escape") {
        if (
          editingCanvasText
        ) {
          const activeObject =
            canvas?.getActiveObject();

          activeObject?.exitEditing?.();

          canvas?.requestRenderAll();

          return;
        }

        canvas?.discardActiveObject();
        canvas?.requestRenderAll();

        onEscape?.();

        return;
      }

      /*
       * Avoid canvas shortcuts while the user types in an
       * HTML field or edits Fabric text.
       */
      if (
        editingHtml ||
        editingCanvasText
      ) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Delete selected object
      |--------------------------------------------------------------------------
      */

      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        event.preventDefault();

        onDelete?.();

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Undo
      |--------------------------------------------------------------------------
      */

      if (
        modifierKey &&
        key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        await onUndo?.();

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Redo
      |--------------------------------------------------------------------------
      |
      | Windows:
      | Ctrl + Y
      | Ctrl + Shift + Z
      |
      | macOS:
      | Cmd + Shift + Z
      |
      */

      if (
        modifierKey &&
        (
          key === "y" ||
          (
            key === "z" &&
            event.shiftKey
          )
        )
      ) {
        event.preventDefault();

        await onRedo?.();

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
        event.preventDefault();

        await onDuplicate?.();

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
        event.preventDefault();

        await onCopy?.();

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
        event.preventDefault();

        await onPaste?.();

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
        event.preventDefault();

        onSelectAll?.();

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
        event.preventDefault();

        await onSave?.();

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Move layer forward
      |--------------------------------------------------------------------------
      |
      | Ctrl/Cmd + ]
      |
      */

      if (
        modifierKey &&
        event.key === "]"
      ) {
        event.preventDefault();

        onMoveForward?.();

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Move layer backward
      |--------------------------------------------------------------------------
      |
      | Ctrl/Cmd + [
      |
      */

      if (
        modifierKey &&
        event.key === "["
      ) {
        event.preventDefault();

        onMoveBackward?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    canvas,
    enabled,

    onUndo,
    onRedo,

    onDelete,
    onDuplicate,

    onCopy,
    onPaste,

    onSelectAll,

    onMoveForward,
    onMoveBackward,

    onSave,
    onEscape,
  ]);
}

export default useKeyboardShortcuts;