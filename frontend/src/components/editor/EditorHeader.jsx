import {
  ArrowLeft,
  ChevronDown,
  Cloud,
  Download,
  MoreHorizontal,
  Redo2,
  Share2,
  Undo2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Logo from "../common/Logo";

import "./EditorHeader.css";

function EditorHeader({
  title = "Untitled Birthday Poster",
  saving = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onDownload,
}) {
  const navigate = useNavigate();

  return (
    <header className="editor-header">
      <div className="editor-header__left">
        <button
          type="button"
          className="editor-header__back"
          onClick={() => navigate("/templates")}
          aria-label="Back to templates"
        >
          <ArrowLeft size={20} />
        </button>

        <Logo compact />

        <div className="editor-header__document">
          <button type="button">
            <span>{title}</span>
            <ChevronDown size={15} />
          </button>

          <div className="editor-header__save-state">
            <Cloud size={14} />

            <span>
              {saving
                ? "Saving changes..."
                : "All changes saved"}
            </span>
          </div>
        </div>
      </div>

      <div className="editor-header__center">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo"
        >
          <Undo2 size={19} />
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
        >
          <Redo2 size={19} />
        </button>
      </div>

      <div className="editor-header__right">
        <button
          type="button"
          className="editor-header__share"
        >
          <Share2 size={17} />
          <span>Share</span>
        </button>

        <button
          type="button"
          className="editor-header__download"
          onClick={onDownload}
        >
          <Download size={17} />
          <span>Download</span>
        </button>

        <button
          type="button"
          className="editor-header__more"
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </header>
  );
}

export default EditorHeader;