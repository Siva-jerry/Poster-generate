import {
  ArrowLeft,
  ChevronDown,
  Cloud,
  Download,
  MoreHorizontal,
  Redo2,
  Share2,
  Undo2,
  Sparkles,
  Check,
} from "lucide-react";
import { useState } from "react";
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
  onOpenAI,
}) {
  const navigate = useNavigate();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [fileFormat, setFileFormat] = useState("png");
  const [isHD, setIsHD] = useState(true);

  const handleDownloadClick = () => {
    if (typeof onDownload === "function") {
      onDownload(fileFormat, isHD ? 2 : 1);
    }
    setDownloadModalOpen(false);
  };

  return (
    <header className="editor-header">
      <div className="editor-header__left">
        <button
          type="button"
          className="editor-header__back"
          onClick={() => navigate("/create")}
          aria-label="Back to Create"
          title="Back to Generator"
        >
          <ArrowLeft size={18} />
          <span className="editor-header__back-text">Back</span>
        </button>

        <Logo compact />

        <div className="editor-header__document">
          <button type="button">
            <span>{title}</span>
          </button>

          <div className="editor-header__save-state">
            <Cloud size={13} />
            <span>
              {saving
                ? "Saving changes..."
                : "All changes saved to canvas"}
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
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="editor-header__right">
        {onOpenAI && (
          <button
            type="button"
            className="editor-header__ai-btn"
            onClick={onOpenAI}
            title="AI Magic Studio"
          >
            <Sparkles size={16} />
            <span>AI Studio</span>
          </button>
        )}

        <div className="editor-header__download-wrapper">
          <button
            type="button"
            className="editor-header__download"
            onClick={() => setDownloadModalOpen(!downloadModalOpen)}
          >
            <Download size={16} />
            <span>Download</span>
            <ChevronDown size={14} />
          </button>

          {downloadModalOpen && (
            <div className="editor-header__download-modal">
              <div className="editor-header__modal-header">
                <strong>Download Design</strong>
                <span>Canva Export Quality</span>
              </div>

              <div className="editor-header__modal-section">
                <label>File Type</label>
                <div className="editor-header__format-selector">
                  <button
                    type="button"
                    className={fileFormat === "png" ? "active" : ""}
                    onClick={() => setFileFormat("png")}
                  >
                    <span>PNG</span>
                    <small>High resolution graphic</small>
                  </button>
                  <button
                    type="button"
                    className={fileFormat === "jpg" ? "active" : ""}
                    onClick={() => setFileFormat("jpg")}
                  >
                    <span>JPG</span>
                    <small>Standard image file</small>
                  </button>
                </div>
              </div>

              <div className="editor-header__modal-section">
                <label>Quality & Resolution</label>
                <div className="editor-header__hd-toggle">
                  <input
                    type="checkbox"
                    id="hd-toggle"
                    checked={isHD}
                    onChange={(e) => setIsHD(e.target.checked)}
                  />
                  <label htmlFor="hd-toggle">
                    <strong>2x Ultra-HD Resolution</strong>
                    <small>2160 × 2700 px (Best for printing)</small>
                  </label>
                </div>
              </div>

              <button
                type="button"
                className="editor-header__confirm-download"
                onClick={handleDownloadClick}
              >
                <Download size={16} />
                <span>Download {fileFormat.toUpperCase()}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default EditorHeader;