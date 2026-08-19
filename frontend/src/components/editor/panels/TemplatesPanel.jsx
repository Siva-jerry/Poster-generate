import React, { useState, useEffect } from "react";
import { Search, Sparkles, Filter, Check } from "lucide-react";
import api from "../../../services/api";
import "./TemplatesPanel.css";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "luxury", label: "VIP Gold" },
  { id: "college", label: "College" },
  { id: "cinematic", label: "Cinematic" },
  { id: "sports", label: "Sports" },
  { id: "neon", label: "Neon" },
  { id: "floral", label: "Floral" },
];

function TemplatesPanel({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      try {
        const params = { limit: 24 };
        if (category !== "all") params.category = category;
        if (search.trim()) params.search = search.trim();
        const res = await api.get("/templates", { params });
        setTemplates(res.data?.templates || []);
      } catch (err) {
        console.error("Failed to load editor templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [category, search]);

  const handleApply = (template) => {
    setSelectedId(template.id);
    if (typeof onSelectTemplate === "function") {
      onSelectTemplate(template);
    }
  };

  return (
    <div className="templates-panel">
      {/* Search Input */}
      <div className="templates-panel__search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search birthday templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="templates-panel__categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={category === cat.id ? "active" : ""}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="templates-panel__grid">
        {loading ? (
          <div className="templates-panel__loading">
            <Sparkles size={24} className="spin-slow" />
            <span>Loading Canva templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="templates-panel__empty">
            <p>No matching templates found.</p>
          </div>
        ) : (
          templates.map((tpl) => {
            const previewSrc = tpl.preview?.url
              ? `http://localhost:5000${tpl.preview.url.startsWith("/") ? "" : "/"}${tpl.preview.url}`
              : `http://localhost:5000/api/templates/${encodeURIComponent(tpl.id)}/preview.svg`;

            return (
              <div
                key={tpl.id}
                className={`templates-panel__card ${selectedId === tpl.id ? "selected" : ""}`}
                onClick={() => handleApply(tpl)}
              >
                <img
                  src={previewSrc}
                  alt={tpl.name}
                  loading="lazy"
                />
                <div className="templates-panel__card-overlay">
                  <span>{tpl.name}</span>
                  {selectedId === tpl.id && <Check size={16} className="check-icon" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TemplatesPanel;
