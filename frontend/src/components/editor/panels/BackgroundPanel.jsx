import React, { useState } from "react";
import { Palette, Check, Sparkles } from "lucide-react";
import "./BackgroundPanel.css";

const SOLID_COLORS = [
  "#050505", "#0F172A", "#1E1B4B", "#140508", "#061A14", "#FFFFFF",
  "#F8FAFC", "#F1F5F9", "#CBD5E1", "#D4AF37", "#FF3864", "#7C3CFF",
  "#38EF7D", "#00F2FE", "#FF9E2C", "#FFD700",
];

const GRADIENT_PRESETS = [
  { id: "black-gold", name: "Black & Gold VIP", style: "linear-gradient(135deg, #111111, #2A1C05, #080808)", colors: ["#111111", "#2A1C05", "#080808"] },
  { id: "royal-blue", name: "Royal Navy Star", style: "linear-gradient(135deg, #0A1128, #1C3166, #050B1A)", colors: ["#0A1128", "#1C3166", "#050B1A"] },
  { id: "cyberpunk", name: "Cyberpunk Violet", style: "linear-gradient(135deg, #0D0221, #331657, #FF3864)", colors: ["#0D0221", "#331657", "#FF3864"] },
  { id: "rose-pink", name: "Rose Gold Glamour", style: "linear-gradient(135deg, #200510, #4A1024, #FF7597)", colors: ["#200510", "#4A1024", "#FF7597"] },
  { id: "emerald", name: "Emerald Luxury", style: "linear-gradient(135deg, #04140D, #0D3825, #38EF7D)", colors: ["#04140D", "#0D3825", "#38EF7D"] },
  { id: "sunset", name: "Sunset Orange", style: "linear-gradient(135deg, #1A0A05, #4A1A08, #FF6B1A)", colors: ["#1A0A05", "#4A1A08", "#FF6B1A"] },
  { id: "tokyo-night", name: "Tokyo Night", style: "linear-gradient(135deg, #080B1A, #141C3D, #00F2FE)", colors: ["#080B1A", "#141C3D", "#00F2FE"] },
  { id: "champagne", name: "Champagne Pearl", style: "linear-gradient(135deg, #FAF7F2, #EDE2D1, #D4AF37)", colors: ["#FAF7F2", "#EDE2D1", "#D4AF37"] },
];

function BackgroundPanel({ onSetBackground }) {
  const [selectedBg, setSelectedBg] = useState(null);
  const [customColor, setCustomColor] = useState("#050505");

  const handleApplySolid = (color) => {
    setSelectedBg(color);
    if (typeof onSetBackground === "function") {
      onSetBackground({ type: "solid", color });
    }
  };

  const handleApplyGradient = (preset) => {
    setSelectedBg(preset.id);
    if (typeof onSetBackground === "function") {
      onSetBackground({ type: "gradient", gradient: preset });
    }
  };

  return (
    <div className="background-panel">
      {/* Custom Color Input */}
      <div className="background-panel__custom">
        <label>
          <Palette size={16} />
          <span>Custom Solid Color</span>
        </label>
        <div className="background-panel__color-picker">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              handleApplySolid(e.target.value);
            }}
          />
          <code>{customColor}</code>
        </div>
      </div>

      {/* Solid Palette Swatches */}
      <div className="background-panel__section">
        <span>Solid Colors</span>
        <div className="background-panel__solids-grid">
          {SOLID_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`background-panel__solid-btn ${selectedBg === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => handleApplySolid(color)}
              title={color}
            >
              {selectedBg === color && <Check size={14} color={color === "#FFFFFF" || color === "#F8FAFC" ? "#000000" : "#FFFFFF"} />}
            </button>
          ))}
        </div>
      </div>

      {/* Rich Gradients */}
      <div className="background-panel__section">
        <span>Celebration Gradients</span>
        <div className="background-panel__gradients-grid">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`background-panel__gradient-card ${selectedBg === preset.id ? "active" : ""}`}
              style={{ background: preset.style }}
              onClick={() => handleApplyGradient(preset)}
            >
              <span className="gradient-title">{preset.name}</span>
              {selectedBg === preset.id && <Check size={16} className="check-icon" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BackgroundPanel;
