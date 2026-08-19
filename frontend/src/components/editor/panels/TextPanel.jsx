import React, { useState } from "react";
import { Heading1, Heading2, Pilcrow, Plus, Search, Sparkles, Type, Star } from "lucide-react";
import "./TextPanel.css";

const FONT_COMBINATIONS = [
  {
    id: "royal-gold",
    title: "Royal Gold 3D",
    sample: "VIP CELEBRATION",
    style: {
      fontFamily: "Arial",
      fontSize: 58,
      fontWeight: "900",
      fill: "#D4AF37",
      charSpacing: 100,
      shadow: "rgba(0,0,0,0.9) 2px 4px 12px",
    },
  },
  {
    id: "cyber-neon",
    title: "Cyber Neon Glow",
    sample: "HAPPY BIRTHDAY",
    style: {
      fontFamily: "Impact",
      fontSize: 60,
      fontWeight: "900",
      fill: "#00F2FE",
      charSpacing: 80,
      shadow: "#00F2FE 0px 0px 18px",
    },
  },
  {
    id: "varsity-champion",
    title: "Varsity Champion",
    sample: "GOLD MEDALIST",
    style: {
      fontFamily: "Georgia",
      fontSize: 52,
      fontWeight: "bold",
      fill: "#FFDF73",
      charSpacing: 60,
      stroke: "#000000",
      strokeWidth: 1.5,
    },
  },
  {
    id: "luxury-vogue",
    title: "Luxury Vogue Serif",
    sample: "DISTINCTION & HONORS",
    style: {
      fontFamily: "Playfair Display",
      fontSize: 48,
      fontWeight: "bold",
      fill: "#FFFFFF",
      charSpacing: 120,
    },
  },
  {
    id: "cursive-script",
    title: "Golden Cursive Script",
    sample: "Best Wishes & Love",
    style: {
      fontFamily: "Pacifico",
      fontSize: 46,
      fill: "#FFD700",
    },
  },
  {
    id: "blockbuster-impact",
    title: "Blockbuster 3D",
    sample: "MASS HERO 2026",
    style: {
      fontFamily: "Impact",
      fontSize: 56,
      fill: "#FF3864",
      charSpacing: 40,
    },
  },
];

function TextPanel({ addHeading, addSubHeading, addBody, onAddCustomStyle }) {
  const [search, setSearch] = useState("");

  const filteredCombos = FONT_COMBINATIONS.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.sample.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStyle = (preset) => {
    if (typeof onAddCustomStyle === "function") {
      onAddCustomStyle(preset);
    } else if (addHeading) {
      addHeading({
        text: preset.sample,
        fontFamily: preset.style.fontFamily,
        fontSize: preset.style.fontSize,
        fill: preset.style.fill,
        fontWeight: preset.style.fontWeight,
      });
    }
  };

  return (
    <div className="text-panel">
      {/* Primary Add a Text Box Button */}
      <button
        type="button"
        className="text-panel__primary-btn"
        onClick={() => addHeading?.()}
      >
        <Plus size={18} />
        <span>Add a text box</span>
      </button>

      {/* Default Typography Hierarchy */}
      <div className="text-panel__presets">
        <button
          type="button"
          className="text-panel__preset-card text-panel__preset-card--heading"
          onClick={() => addHeading?.()}
        >
          <span className="text-panel__heading-demo">Add a heading</span>
          <small>64px Bold</small>
        </button>

        <button
          type="button"
          className="text-panel__preset-card text-panel__preset-card--subheading"
          onClick={() => addSubHeading?.()}
        >
          <span className="text-panel__subheading-demo">Add a subheading</span>
          <small>36px Medium</small>
        </button>

        <button
          type="button"
          className="text-panel__preset-card text-panel__preset-card--body"
          onClick={() => addBody?.()}
        >
          <span className="text-panel__body-demo">Add a little bit of body text</span>
          <small>22px Regular</small>
        </button>
      </div>

      {/* Font Combinations Header */}
      <div className="text-panel__combos-header">
        <Sparkles size={16} className="sparkle-icon" />
        <span>Font combinations & Styles</span>
      </div>

      {/* Font Combinations Grid */}
      <div className="text-panel__combos-list">
        {filteredCombos.map((item) => (
          <button
            key={item.id}
            type="button"
            className="text-panel__combo-card"
            onClick={() => handleAddStyle(item)}
            title={`Add ${item.title}`}
          >
            <span
              className="text-panel__combo-preview"
              style={{
                fontFamily: item.style.fontFamily,
                color: item.style.fill,
              }}
            >
              {item.sample}
            </span>
            <small>{item.title}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TextPanel;