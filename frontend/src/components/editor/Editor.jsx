import {
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  AlertTriangle,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";

import BottomPages from "./BottomPages";
import EditorCanvas from "./EditorCanvas";
import EditorHeader from "./EditorHeader";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";

import TextPanel from "./panels/TextPanel";

/*
|--------------------------------------------------------------------------
| Project-specific paths
|--------------------------------------------------------------------------
|
| Editor.jsx:
| src/components/editor/Editor.jsx
|
| Fabric hook:
| src/hooks/useFabricCanvas.js
|
| Editor store:
| src/components/store/editorStore.js
|
*/

import useFabricCanvas from "../../hooks/useFabricCanvas";
import useEditorStore from "../store/editorStore";

import "./Editor.css";

/*
|--------------------------------------------------------------------------
| Tool-panel information
|--------------------------------------------------------------------------
*/

const TOOL_PANEL_INFORMATION = {
  templates: {
    eyebrow: "Templates",
    title: "Premium Templates",
    description:
      "Browse modern poster layouts and apply them to your design.",
  },

  elements: {
    eyebrow: "Elements",
    title: "Design Elements",
    description:
      "Add shapes, lines, stickers, decorations and visual effects.",
  },

  text: {
    eyebrow: "Text",
    title: "Add Text",
    description:
      "Add headings, subheadings and editable body text.",
  },

  uploads: {
    eyebrow: "Uploads",
    title: "Your Uploads",
    description:
      "Upload student photos, logos and custom design assets.",
  },

  photos: {
    eyebrow: "Photos",
    title: "Photo Library",
    description:
      "Browse photos and add them to the current poster.",
  },

  background: {
    eyebrow: "Background",
    title: "Poster Background",
    description:
      "Choose colours, gradients, textures and visual backgrounds.",
  },

  fonts: {
    eyebrow: "Fonts",
    title: "Premium Fonts",
    description:
      "Apply expressive typography styles to selected text objects.",
  },

  frames: {
    eyebrow: "Frames",
    title: "Photo Frames",
    description:
      "Place photos inside editable premium frames and masks.",
  },

  ai: {
    eyebrow: "AI Studio",
    title: "Describe Any Design",
    description:
      "Create cinematic, luxury, sports, traditional or custom poster concepts.",
  },

  layers: {
    eyebrow: "Layers",
    title: "Design Layers",
    description:
      "Select, reorder, lock and manage all poster objects.",
  },

  settings: {
    eyebrow: "Settings",
    title: "Editor Settings",
    description:
      "Configure canvas behaviour, snapping, guides and preferences.",
  },
};

/*
|--------------------------------------------------------------------------
| Safe tool information
|--------------------------------------------------------------------------
*/

function getToolInformation(toolId) {
  return (
    TOOL_PANEL_INFORMATION[toolId] ||
    TOOL_PANEL_INFORMATION.templates
  );
}

/*
|--------------------------------------------------------------------------
| Editor
|--------------------------------------------------------------------------
*/

function Editor() {
  /*
  |--------------------------------------------------------------------------
  | Fabric DOM references
  |--------------------------------------------------------------------------
  */

  const canvasElementRef =
    useRef(null);

  const workspaceElementRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Store state
  |--------------------------------------------------------------------------
  */

  const activeTool =
    useEditorStore(
      (state) =>
        state.activeTool
    );

  const toolPanelOpen =
    useEditorStore(
      (state) =>
        state.toolPanelOpen
    );

  const selectedObject =
    useEditorStore(
      (state) =>
        state.selectedObject
    );

  const pages =
    useEditorStore(
      (state) =>
        state.pages
    );

  const activePageId =
    useEditorStore(
      (state) =>
        state.activePageId
    );

  const documentTitle =
    useEditorStore(
      (state) =>
        state.documentTitle
    );

  const isSaving =
    useEditorStore(
      (state) =>
        state.isSaving
    );

  const isDirty =
    useEditorStore(
      (state) =>
        state.isDirty
    );

  const lastSavedAt =
    useEditorStore(
      (state) =>
        state.lastSavedAt
    );

  const editorError =
    useEditorStore(
      (state) =>
        state.editorError
    );

  /*
  |--------------------------------------------------------------------------
  | Store actions
  |--------------------------------------------------------------------------
  */

  const setActiveTool =
    useEditorStore(
      (state) =>
        state.setActiveTool
    );

  const setToolPanelOpen =
    useEditorStore(
      (state) =>
        state.setToolPanelOpen
    );

  const toggleToolPanel =
    useEditorStore(
      (state) =>
        state.toggleToolPanel
    );

  const setActivePageId =
    useEditorStore(
      (state) =>
        state.setActivePageId
    );

  const addPage =
    useEditorStore(
      (state) =>
        state.addPage
    );

  const removePage =
    useEditorStore(
      (state) =>
        state.removePage
    );

  const clearSelectedObject =
    useEditorStore(
      (state) =>
        state.clearSelectedObject
    );

  const setEditorError =
    useEditorStore(
      (state) =>
        state.setEditorError
    );

  /*
  |--------------------------------------------------------------------------
  | Stable canvas-ready callback
  |--------------------------------------------------------------------------
  */

  const handleCanvasReady =
    useCallback(
      (fabricCanvas) => {
        console.log(
          "Fabric canvas ready:",
          fabricCanvas
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Fabric canvas
  |--------------------------------------------------------------------------
  */

  const {
    canvas,
    ready,
    zoom,

    zoomIn,
    zoomOut,
    fitToWorkspace,
    resetZoom,

    deleteSelected,
    duplicateSelected,

    copySelected,
    pasteClipboard,

    moveSelectedForward,
    moveSelectedBackward,

    saveCanvas,

    /*
     * Text engine actions
     */
    addHeading,
    addSubHeading,
    addBody,
  } = useFabricCanvas({
    canvasElementRef,
    workspaceElementRef,

    width: 1080,
    height: 1350,

    backgroundColor:
      "#FFFFFF",

    onReady:
      handleCanvasReady,
  });

  /*
  |--------------------------------------------------------------------------
  | Tool information
  |--------------------------------------------------------------------------
  */

  const activeToolInformation =
    useMemo(
      () =>
        getToolInformation(
          activeTool
        ),
      [activeTool]
    );

  /*
  |--------------------------------------------------------------------------
  | Save status
  |--------------------------------------------------------------------------
  */

  const saveStatus =
    useMemo(() => {
      if (isSaving) {
        return "Saving changes...";
      }

      if (isDirty) {
        return "Unsaved changes";
      }

      if (lastSavedAt) {
        return "All changes saved";
      }

      return ready
        ? "Canvas ready"
        : "Starting editor";
    }, [
      isSaving,
      isDirty,
      lastSavedAt,
      ready,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Tool selection
  |--------------------------------------------------------------------------
  */

  const handleToolChange =
    useCallback(
      (toolId) => {
        if (
          toolId === activeTool &&
          toolPanelOpen
        ) {
          setToolPanelOpen(false);
          return;
        }

        setActiveTool(toolId);
      },
      [
        activeTool,
        toolPanelOpen,
        setActiveTool,
        setToolPanelOpen,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Add-page action
  |--------------------------------------------------------------------------
  */

  const handleAddPage =
    useCallback(() => {
      addPage();
    }, [addPage]);

  /*
  |--------------------------------------------------------------------------
  | Delete-page action
  |--------------------------------------------------------------------------
  */

  const handleDeletePage =
    useCallback(() => {
      removePage(activePageId);
    }, [
      activePageId,
      removePage,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Open AI panel
  |--------------------------------------------------------------------------
  */

  const handleOpenAI =
    useCallback(() => {
      setActiveTool("ai");
      setToolPanelOpen(true);
    }, [
      setActiveTool,
      setToolPanelOpen,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Download PNG
  |--------------------------------------------------------------------------
  */

  const handleDownload =
    useCallback(() => {
      if (!canvas) {
        setEditorError(
          "The poster canvas is not ready."
        );

        return;
      }

      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const dataUrl =
        canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });

      const safeFilename =
        documentTitle
          .trim()
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          )
          .toLowerCase() ||
        "smartwish-poster";

      const downloadLink =
        document.createElement(
          "a"
        );

      downloadLink.href =
        dataUrl;

      downloadLink.download =
        `${safeFilename}.png`;

      document.body.appendChild(
        downloadLink
      );

      downloadLink.click();
      downloadLink.remove();
    }, [
      canvas,
      documentTitle,
      setEditorError,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Tool-panel content
  |--------------------------------------------------------------------------
  */

  function renderToolPanelContent() {
    /*
     * Text panel
     */
    if (activeTool === "text") {
      return (
        <TextPanel
          addHeading={
            addHeading
          }
          addSubHeading={
            addSubHeading
          }
          addBody={
            addBody
          }
        />
      );
    }

    /*
     * AI placeholder
     */
    if (activeTool === "ai") {
      return (
        <div className="editor__ai-card">
          <div className="editor__ai-icon">
            <Sparkles
              size={25}
            />
          </div>

          <span>
            Universal prompt
          </span>

          <h3>
            Describe any poster
          </h3>

          <p>
            Write any design idea.
            SmartWish AI will convert
            it into editable layers.
          </p>

          <label>
            Your design prompt

            <textarea
              rows="7"
              placeholder="Example: Create a cinematic Formula 1 birthday poster with red racing lights, carbon-fibre textures and bold premium typography."
            />
          </label>

          <button
            type="button"
            disabled
          >
            <Sparkles
              size={17}
            />

            Generate editable design
          </button>

          <small>
            AI generation will be
            connected after the
            editor tools are stable.
          </small>
        </div>
      );
    }

    /*
     * Other panel placeholders
     */
    return (
      <div className="editor__panel-placeholder">
        <div className="editor__panel-placeholder-icon">
          <Sparkles
            size={22}
          />
        </div>

        <span>
          {
            activeToolInformation.eyebrow
          }
        </span>

        <strong>
          Panel foundation ready
        </strong>

        <p>
          The complete{" "}
          {
            activeToolInformation.title
          }{" "}
          controls will be added in
          the next editor sections.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        "editor",

        toolPanelOpen
          ? "editor--panel-open"
          : "editor--panel-closed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <EditorHeader
        title={
          documentTitle
        }

        saving={
          isSaving
        }

        saveStatus={
          saveStatus
        }

        canUndo={
          false
        }

        canRedo={
          false
        }

        onUndo={() => {}}

        onRedo={() => {}}

        onSave={
          saveCanvas
        }

        onDownload={
          handleDownload
        }

        onOpenAI={
          handleOpenAI
        }
      />

      <div className="editor__body">
        <LeftSidebar
          activeTool={
            activeTool
          }

          onToolChange={
            handleToolChange
          }
        />

        <aside
          className={[
            "editor__tool-panel",

            toolPanelOpen
              ? "editor__tool-panel--visible"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <header className="editor__tool-header">
            <div>
              <span>
                {
                  activeToolInformation.eyebrow
                }
              </span>

              <h2>
                {
                  activeToolInformation.title
                }
              </h2>

              <p>
                {
                  activeToolInformation.description
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToolPanelOpen(
                  false
                )
              }
              aria-label="Close tool panel"
            >
              <X size={19} />
            </button>
          </header>

          <div className="editor__tool-content">
            {renderToolPanelContent()}
          </div>
        </aside>

        {!toolPanelOpen && (
          <button
            type="button"

            className="editor__panel-reopen"

            onClick={
              toggleToolPanel
            }

            aria-label="Open tool panel"
          >
            <PanelLeftOpen
              size={19}
            />
          </button>
        )}

        <main className="editor__main">
          <EditorCanvas
            canvasElementRef={
              canvasElementRef
            }

            workspaceElementRef={
              workspaceElementRef
            }

            canvas={
              canvas
            }

            zoom={
              zoom
            }

            loading={
              false
            }

            ready={
              ready
            }

            error={
              editorError
            }

            onZoomIn={
              zoomIn
            }

            onZoomOut={
              zoomOut
            }

            onFit={
              fitToWorkspace
            }

            onResetZoom={
              resetZoom
            }
          />

          <BottomPages
            pages={
              pages
            }

            activePageId={
              activePageId
            }

            onSelectPage={
              setActivePageId
            }

            onAddPage={
              handleAddPage
            }

            onDeletePage={
              handleDeletePage
            }
          />
        </main>

        <RightPanel
          selectedObject={
            selectedObject
          }

          canvas={
            canvas
          }

          onDelete={
            deleteSelected
          }

          onDuplicate={
            duplicateSelected
          }

          onCopy={
            copySelected
          }

          onPaste={
            pasteClipboard
          }

          onMoveForward={
            moveSelectedForward
          }

          onMoveBackward={
            moveSelectedBackward
          }

          onClearSelection={
            clearSelectedObject
          }
        />
      </div>

      {editorError && (
        <div className="editor__error">
          <AlertTriangle
            size={19}
          />

          <div>
            <strong>
              Editor error
            </strong>

            <p>
              {editorError}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditorError("")
            }
            aria-label="Close error message"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Editor;