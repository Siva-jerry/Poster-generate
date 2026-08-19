import React, { useState, useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, Trash2, Check, User } from "lucide-react";
import "./UploadsPanel.css";

function UploadsPanel({ onAddImage }) {
  const [uploads, setUploads] = useState([
    {
      id: "demo-student-1",
      name: "Student Portrait (Sample)",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "demo-student-2",
      name: "Graduation Portrait",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    },
  ]);
  const [removeBg, setRemoveBg] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const newUpload = {
        id: `upload-${Date.now()}`,
        name: file.name,
        url: dataUrl,
      };
      setUploads((prev) => [newUpload, ...prev]);
      setUploading(false);

      if (typeof onAddImage === "function") {
        onAddImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectImage = (url) => {
    if (typeof onAddImage === "function") {
      onAddImage(url);
    }
  };

  return (
    <div className="uploads-panel">
      {/* Upload Action Button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <button
        type="button"
        className="uploads-panel__upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload size={18} />
        <span>{uploading ? "Uploading Image..." : "Upload Student Photo / Logo"}</span>
      </button>

      {/* AI Background Removal Toggle */}
      <div className="uploads-panel__bg-toggle">
        <label className="uploads-panel__switch">
          <input
            type="checkbox"
            checked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
          />
          <span className="slider" />
        </label>
        <div className="uploads-panel__bg-label">
          <strong>
            <Sparkles size={14} className="sparkle-icon" />
            AI Background Remover
          </strong>
          <small>Auto-cutout student photo on import</small>
        </div>
      </div>

      {/* Uploads Gallery Header */}
      <div className="uploads-panel__header">
        <span>Uploaded Assets ({uploads.length})</span>
      </div>

      {/* Uploads Grid */}
      <div className="uploads-panel__grid">
        {uploads.map((item) => (
          <div
            key={item.id}
            className="uploads-panel__card"
            onClick={() => handleSelectImage(item.url)}
          >
            <img src={item.url} alt={item.name} />
            <div className="uploads-panel__card-overlay">
              <span>{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadsPanel;
