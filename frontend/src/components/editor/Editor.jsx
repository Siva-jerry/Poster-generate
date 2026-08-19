import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
import TopCanvasToolbar from "./TopCanvasToolbar";

import TextPanel from "./panels/TextPanel";
import TemplatesPanel from "./panels/TemplatesPanel";
import ElementsPanel from "./panels/ElementsPanel";
import UploadsPanel from "./panels/UploadsPanel";
import BackgroundPanel from "./panels/BackgroundPanel";
import LayersPanel from "./panels/LayersPanel";
import AIPanel from "./panels/AIPanel";

import useFabricCanvas from "../../hooks/useFabricCanvas";
import useEditorStore from "../store/editorStore";
import { loadPosterTemplate } from "../../../utils/templateLoader";

import "./Editor.css";

/*
|--------------------------------------------------------------------------
| Tool-panel information
|--------------------------------------------------------------------------
*/

const TOOL_PANEL_INFORMATION = {
  templates: {
    eyebrow: "Templates",
    title: "Design Templates",
    description: "Browse rich celebration flex layouts and apply directly to your poster.",
  },
  elements: {
    eyebrow: "Elements",
    title: "Celebration Graphics",
    description: "Add 3D balloons, cakes, gift boxes, crowns, ribbons and sparkles.",
  },
  text: {
    eyebrow: "Text",
    title: "Text & Typography",
    description: "Add headings, student names, department badges and quote styles.",
  },
  uploads: {
    eyebrow: "Uploads",
    title: "Student Photo & Logo",
    description: "Upload student portraits with AI background removal and college seals.",
  },
  background: {
    eyebrow: "Background",
    title: "Poster Background",
    description: "Choose 3-stop rich gradients, solid colors and atmospheric textures.",
  },
  layers: {
    eyebrow: "Layers",
    title: "Poster Layers",
    description: "Reorder, lock, hide, and manage all canvas elements.",
  },
  ai: {
    eyebrow: "AI Studio",
    title: "AI Magic Generator",
    description: "Describe any poster concept to create custom layers instantly.",
  },
};

function getToolInformation(toolId) {
  return TOOL_PANEL_INFORMATION[toolId] || TOOL_PANEL_INFORMATION.templates;
}

function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingState = location.state || {};

  const canvasElementRef = useRef(null);
  const workspaceElementRef = useRef(null);

  const activeTool = useEditorStore((state) => state.activeTool);
  const toolPanelOpen = useEditorStore((state) => state.toolPanelOpen);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const pages = useEditorStore((state) => state.pages);
  const activePageId = useEditorStore((state) => state.activePageId);
  const documentTitle = useEditorStore((state) => state.documentTitle);
  const isSaving = useEditorStore((state) => state.isSaving);
  const isDirty = useEditorStore((state) => state.isDirty);
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);
  const editorError = useEditorStore((state) => state.editorError);

  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const setToolPanelOpen = useEditorStore((state) => state.setToolPanelOpen);
  const toggleToolPanel = useEditorStore((state) => state.toggleToolPanel);
  const setActivePageId = useEditorStore((state) => state.setActivePageId);
  const addPage = useEditorStore((state) => state.addPage);
  const removePage = useEditorStore((state) => state.removePage);
  const setEditorError = useEditorStore((state) => state.setEditorError);
  const setDocumentTitle = useEditorStore((state) => state.setDocumentTitle);

  // Set document title if incoming from generated poster
  useEffect(() => {
    if (incomingState.studentName) {
      setDocumentTitle(`${incomingState.studentName} Birthday Poster`);
    } else if (incomingState.posterTitle) {
      setDocumentTitle(incomingState.posterTitle);
    }
  }, [incomingState, setDocumentTitle]);

  const handleCanvasReady = useCallback((fabricCanvas) => {
    if (!fabricCanvas) return;

    if (incomingState.posterImage || incomingState.studentName) {
      loadPosterTemplate(fabricCanvas, {
        posterImage: incomingState.posterImage || null,
        collegeName: incomingState.collegeName || "COLLEGE OF ENGINEERING & TECHNOLOGY",
        studentName: incomingState.studentName || "HERMIONE JEAN GRANGER",
        department: incomingState.department || "Dept. of Computer Science & Engineering",
        year: incomingState.year || "Final Year",
        rollNo: incomingState.rollNo || "",
        heading: incomingState.birthdayHeading || "HAPPY BIRTHDAY",
        quote: incomingState.birthdayQuote || "Wishing you a spectacular birthday filled with happiness, triumph and great memories!",
        theme: "gold",
      });
    } else if (fabricCanvas.getObjects().length === 0) {
      loadPosterTemplate(fabricCanvas, {
        collegeName: "COLLEGE OF ENGINEERING & TECHNOLOGY",
        studentName: "HERMIONE JEAN GRANGER",
        department: "Dept. of Computer Science",
        year: "Final Year",
        heading: "HAPPY BIRTHDAY",
        quote: "Wishing you success, joy and wonderful milestones ahead!",
        theme: "gold",
      });
    }
  }, [incomingState]);

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
    moveSelectedForward,
    moveSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,
    saveCanvas,
    addHeading,
    addSubHeading,
    addBody,
    setFont,
    setFontSize,
    setFillColor,
    setAlignment,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setLetterSpacing,
    setLineHeight,
    addImage,
    addElement,
    setBackground,
    setOpacity,
    flipHorizontal,
    flipVertical,
    lockSelected,
    unlockSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({
    canvasElementRef,
    workspaceElementRef,
    width: 1080,
    height: 1350,
    backgroundColor: "#0A0A0E",
    onReady: handleCanvasReady,
  });

  useEffect(() => {
    if (ready && canvas && canvas.getObjects().length === 0) {
      handleCanvasReady(canvas);
    }
  }, [ready, canvas, handleCanvasReady]);

  const activeToolInformation = useMemo(() => getToolInformation(activeTool), [activeTool]);

  const saveStatus = useMemo(() => {
    if (isSaving) return "Saving changes...";
    if (isDirty) return "Unsaved changes";
    if (lastSavedAt) return "All changes saved";
    return ready ? "Canvas ready" : "Starting editor";
  }, [isSaving, isDirty, lastSavedAt, ready]);

  const handleToolChange = useCallback((toolId) => {
    if (toolId === activeTool && toolPanelOpen) {
      setToolPanelOpen(false);
      return;
    }
    setActiveTool(toolId);
    setToolPanelOpen(true);
  }, [activeTool, toolPanelOpen, setActiveTool, setToolPanelOpen]);

  const handleAddPage = useCallback(() => {
    addPage();
  }, [addPage]);

  const handleDeletePage = useCallback(() => {
    removePage(activePageId);
  }, [activePageId, removePage]);

  const handleOpenAI = useCallback(() => {
    setActiveTool("ai");
    setToolPanelOpen(true);
  }, [setActiveTool, setToolPanelOpen]);

  const handleDownload = useCallback((format = "png", multiplier = 2) => {
    if (!canvas) {
      setEditorError("The poster canvas is not ready.");
      return;
    }

    canvas.discardActiveObject();

    const currentZoom = canvas.getZoom();
    canvas.setDimensions({ width: 1080, height: 1350 });
    canvas.setZoom(1);
    canvas.requestRenderAll();

    const dataUrl = canvas.toDataURL({
      format: format === "jpeg" || format === "jpg" ? "jpeg" : "png",
      quality: 1,
      multiplier: multiplier || 2, // 2x Crisp HD Resolution
    });

    canvas.setDimensions({
      width: Math.round(1080 * currentZoom),
      height: Math.round(1350 * currentZoom),
    });
    canvas.setZoom(currentZoom);
    canvas.requestRenderAll();

    const safeFilename =
      documentTitle
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "birthday-poster";

    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = `${safeFilename}.${format === "jpeg" || format === "jpg" ? "jpg" : "png"}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }, [canvas, documentTitle, setEditorError]);

  /*
  |--------------------------------------------------------------------------
  | Canva-Style Handlers
  |--------------------------------------------------------------------------
  */

  const handleSelectTemplate = useCallback((template) => {
    if (!canvas) return;
    try {
      const cat = (template.category || "").toLowerCase();
      let theme = "gold";
      if (cat.includes("neon") || cat.includes("cyber")) theme = "neon";
      else if (cat.includes("royal") || cat.includes("sports")) theme = "royal";
      else if (cat.includes("rose") || cat.includes("pink") || cat.includes("pastel")) theme = "rose";
      else if (cat.includes("cinema") || cat.includes("movie")) theme = "cinema";
      else if (cat.includes("varsity") || cat.includes("college")) theme = "varsity";

      loadPosterTemplate(canvas, {
        collegeName: incomingState.collegeName || "COLLEGE OF ENGINEERING & TECHNOLOGY",
        studentName: incomingState.studentName || "HERMIONE JEAN GRANGER",
        department: incomingState.department || "Dept. of Computer Science & Engineering",
        year: incomingState.year || "Final Year",
        heading: "HAPPY BIRTHDAY",
        quote: incomingState.birthdayQuote || "Wishing you success, joy and wonderful milestones ahead!",
        theme,
      });
    } catch (e) {
      console.error("Failed to load template on canvas:", e);
    }
  }, [canvas, incomingState]);

  const handleAddElement = useCallback((element) => {
    if (!canvas) return;
    addElement(element);
  }, [canvas, addElement]);

  const handleAddImage = useCallback((imageUrl) => {
    if (!canvas) return;
    addImage(imageUrl);
  }, [canvas, addImage]);

  const handleSetBackground = useCallback((bg) => {
    if (!canvas) return;
    setBackground(bg);
  }, [canvas, setBackground]);

  const handleAddCustomTextStyle = useCallback((preset) => {
    if (!canvas) return;
    addHeading({
      text: preset.sample,
      fontFamily: preset.style.fontFamily,
      fontSize: preset.style.fontSize,
      fill: preset.style.fill,
      fontWeight: preset.style.fontWeight || "normal",
    });
  }, [canvas, addHeading]);

  const handleGenerateAI = useCallback((data) => {
    if (!canvas) return;
    const promptText = (data.prompt || "").toLowerCase();
    const theme = promptText.includes("neon") ? "neon" : promptText.includes("royal") ? "royal" : promptText.includes("rose") ? "rose" : promptText.includes("cinema") ? "cinema" : "gold";

    loadPosterTemplate(canvas, {
      collegeName: "COLLEGE OF ENGINEERING & TECHNOLOGY",
      studentName: data.studentName || "HERMIONE JEAN GRANGER",
      department: data.department || "Dept. of Computer Science • Final Year",
      year: "",
      heading: "HAPPY BIRTHDAY",
      quote: "Wishing you success, joy and wonderful milestones ahead!",
      theme,
    });
  }, [canvas]);

  /*
  |--------------------------------------------------------------------------
  | Tool-panel content
  |--------------------------------------------------------------------------
  */

  function renderToolPanelContent() {
    switch (activeTool) {
      case "templates":
        return <TemplatesPanel onSelectTemplate={handleSelectTemplate} />;
      case "elements":
        return <ElementsPanel onAddElement={handleAddElement} />;
      case "text":
        return (
          <TextPanel
            addHeading={addHeading}
            addSubHeading={addSubHeading}
            addBody={addBody}
            onAddCustomStyle={handleAddCustomTextStyle}
          />
        );
      case "uploads":
        return <UploadsPanel onAddImage={handleAddImage} />;
      case "background":
        return <BackgroundPanel onSetBackground={handleSetBackground} />;
      case "layers":
        return <LayersPanel canvas={canvas} />;
      case "ai":
        return <AIPanel onGenerateAI={handleGenerateAI} />;
      default:
        return (
          <TemplatesPanel onSelectTemplate={handleSelectTemplate} />
        );
    }
  }

  return (
    <div
      className={[
        "editor",
        toolPanelOpen ? "editor--panel-open" : "editor--panel-closed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <EditorHeader
        title={documentTitle}
        saving={isSaving}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={saveCanvas}
        onDownload={handleDownload}
        onOpenAI={handleOpenAI}
      />

      <div className="editor__body">
        <LeftSidebar
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />

        <aside
          className={[
            "editor__tool-panel",
            toolPanelOpen ? "editor__tool-panel--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <header className="editor__tool-header">
            <div>
              <span>{activeToolInformation.eyebrow}</span>
              <h2>{activeToolInformation.title}</h2>
              <p>{activeToolInformation.description}</p>
            </div>

            <button
              type="button"
              onClick={() => setToolPanelOpen(false)}
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
            onClick={toggleToolPanel}
            aria-label="Open tool panel"
          >
            <PanelLeftOpen size={19} />
          </button>
        )}

        <main className="editor__main">
          {/* Canva Contextual Top Toolbar */}
          <TopCanvasToolbar
            selectedObject={selectedObject}
            onFontChange={setFont}
            onFontSizeChange={setFontSize}
            onColorChange={setFillColor}
            onBoldToggle={toggleBold}
            onItalicToggle={toggleItalic}
            onUnderlineToggle={toggleUnderline}
            onAlignChange={setAlignment}
            onDuplicate={duplicateSelected}
            onDelete={deleteSelected}
            onBringForward={moveSelectedForward}
            onSendBackward={moveSelectedBackward}
            onBringToFront={bringSelectedToFront}
            onSendToBack={sendSelectedToBack}
            onFlipHorizontal={flipHorizontal}
            onFlipVertical={flipVertical}
            onLock={lockSelected}
            onUnlock={unlockSelected}
            onOpacityChange={setOpacity}
            onLetterSpacingChange={setLetterSpacing}
            onLineHeightChange={setLineHeight}
          />

          <EditorCanvas
            canvasElementRef={canvasElementRef}
            workspaceElementRef={workspaceElementRef}
            canvas={canvas}
            zoom={zoom}
            loading={false}
            ready={ready}
            error={editorError}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFit={fitToWorkspace}
            onResetZoom={resetZoom}
          />

          <BottomPages
            pages={pages}
            activePageId={activePageId}
            onSelectPage={setActivePageId}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
          />
        </main>

        <RightPanel
          canvas={canvas}
          selectedObject={selectedObject}
        />
      </div>
    </div>
  );
}

export default Editor;