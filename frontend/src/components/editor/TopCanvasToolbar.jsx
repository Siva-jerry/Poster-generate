import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  ChevronDown,
  Sparkles,
  Sliders,
  FlipHorizontal,
  FlipVertical,
  CaseSensitive,
  Sun,
} from "lucide-react";
import "./TopCanvasToolbar.css";

const FONTS = [
  "Arial",
  "Georgia",
  "Impact",
  "Inter",
  "Playfair Display",
  "Poppins",
  "Pacifico",
  "Montserrat",
  "Cinzel",
  "Oswald",
  "Bebas Neue",
  "Great Vibes",
  "Roboto",
  "Times New Roman",
  "Courier New",
];

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#D4AF37",
  "#FFD700",
  "#FF6B1A",
  "#FF3864",
  "#00F2FE",
  "#7C3CFF",
  "#38EF7D",
  "#FFE0EC",
  "#1A1A24",
];

function TopCanvasToolbar({
  selectedObject,
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onAlignChange,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onFlipHorizontal,
  onFlipVertical,
  onLock,
  onUnlock,
  onOpacityChange,
  onLetterSpacingChange,
  onLineHeightChange,
  onCaseChange,
  onShadowToggle,
}) {
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    if (selectedObject) {
      setFontSize(Math.round(selectedObject.fontSize || 48));
      setTextColor(typeof selectedObject.fill === "string" ? selectedObject.fill : "#FFFFFF");
      setLetterSpacing(Math.round(selectedObject.charSpacing || 0));
      setLineHeight(Number((selectedObject.lineHeight || 1.2).toFixed(1)));
      setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
    }
  }, [selectedObject]);

  const isText = selectedObject && (selectedObject.type === "text" || selectedObject.type === "i-text" || selectedObject.type === "textbox");
  const isLocked = selectedObject?.lockMovementX && selectedObject?.lockMovementY;

  if (!selectedObject) {
    return (
      <div className="canva-toolbar canva-toolbar--empty">
        <span className="canva-toolbar__hint">
          <Sparkles size={15} className="sparkle-icon" />
          Click any text, photo, or celebration graphic on the canvas to customize like Canva
        </span>
      </div>
    );
  }

  return (
    <div className="canva-toolbar">
      {isText ? (
        <>
          {/* Font Family Dropdown */}
          <div className="canva-toolbar__font-picker">
            <button
              type="button"
              className="canva-toolbar__font-btn"
              onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
            >
              <span>{selectedObject.fontFamily || "Arial"}</span>
              <ChevronDown size={14} />
            </button>

            {fontDropdownOpen && (
              <div className="canva-toolbar__dropdown">
                {FONTS.map((font) => (
                  <button
                    key={font}
                    type="button"
                    style={{ fontFamily: font }}
                    onClick={() => {
                      if (onFontChange) onFontChange(font);
                      setFontDropdownOpen(false);
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Controls */}
          <div className="canva-toolbar__size">
            <button
              type="button"
              onClick={() => {
                const next = Math.max(8, fontSize - 4);
                setFontSize(next);
                if (onFontSizeChange) onFontSizeChange(next);
              }}
            >
              -
            </button>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => {
                const val = Math.max(6, Number(e.target.value));
                setFontSize(val);
                if (onFontSizeChange) onFontSizeChange(val);
              }}
            />
            <button
              type="button"
              onClick={() => {
                const next = fontSize + 4;
                setFontSize(next);
                if (onFontSizeChange) onFontSizeChange(next);
              }}
            >
              +
            </button>
          </div>

          {/* Text Color Picker */}
          <div className="canva-toolbar__color-wrapper">
            <button
              type="button"
              className="canva-toolbar__color-chip"
              style={{ backgroundColor: textColor }}
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              title="Text Color"
            />

            {colorPickerOpen && (
              <div className="canva-toolbar__color-popover">
                <div className="canva-toolbar__swatches">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setTextColor(c);
                        if (onColorChange) onColorChange(c);
                        setColorPickerOpen(false);
                      }}
                    />
                  ))}
                </div>
                <div className="canva-toolbar__custom-color">
                  <span>Custom:</span>
                  <input
                    type="color"
                    value={textColor.startsWith("#") ? textColor : "#FFFFFF"}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      if (onColorChange) onColorChange(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Formatting Buttons */}
          <div className="canva-toolbar__group">
            <button
              type="button"
              className={selectedObject.fontWeight === "bold" || selectedObject.fontWeight >= 700 ? "active" : ""}
              onClick={onBoldToggle}
              title="Bold"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              className={selectedObject.fontStyle === "italic" ? "active" : ""}
              onClick={onItalicToggle}
              title="Italic"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              className={selectedObject.underline ? "active" : ""}
              onClick={onUnderlineToggle}
              title="Underline"
            >
              <Underline size={15} />
            </button>
          </div>

          {/* Alignment */}
          <div className="canva-toolbar__group">
            <button
              type="button"
              className={selectedObject.textAlign === "left" ? "active" : ""}
              onClick={() => onAlignChange && onAlignChange("left")}
              title="Align Left"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              className={selectedObject.textAlign === "center" ? "active" : ""}
              onClick={() => onAlignChange && onAlignChange("center")}
              title="Align Center"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              className={selectedObject.textAlign === "right" ? "active" : ""}
              onClick={() => onAlignChange && onAlignChange("right")}
              title="Align Right"
            >
              <AlignRight size={15} />
            </button>
          </div>

          {/* Spacing Popover */}
          <div className="canva-toolbar__popover-container">
            <button
              type="button"
              className={`canva-toolbar__icon-btn ${spacingOpen ? "active" : ""}`}
              onClick={() => setSpacingOpen(!spacingOpen)}
              title="Letter & Line Spacing"
            >
              <Sliders size={15} />
            </button>

            {spacingOpen && (
              <div className="canva-toolbar__slider-popover">
                <div className="canva-toolbar__slider-row">
                  <span>Letter Spacing: {letterSpacing}</span>
                  <input
                    type="range"
                    min="-50"
                    max="500"
                    step="10"
                    value={letterSpacing}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLetterSpacing(val);
                      if (onLetterSpacingChange) onLetterSpacingChange(val);
                    }}
                  />
                </div>
                <div className="canva-toolbar__slider-row">
                  <span>Line Height: {lineHeight}</span>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLineHeight(val);
                      if (onLineHeightChange) onLineHeightChange(val);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="canva-toolbar__element-info">
          <span>{selectedObject.type ? selectedObject.type.toUpperCase() : "ELEMENT"} SELECTED</span>
        </div>
      )}

      {/* Opacity Slider Popover */}
      <div className="canva-toolbar__popover-container">
        <button
          type="button"
          className={`canva-toolbar__icon-btn ${opacityOpen ? "active" : ""}`}
          onClick={() => setOpacityOpen(!opacityOpen)}
          title="Transparency / Opacity"
        >
          <Sun size={15} />
        </button>

        {opacityOpen && (
          <div className="canva-toolbar__slider-popover">
            <div className="canva-toolbar__slider-row">
              <span>Opacity: {opacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOpacity(val);
                  if (onOpacityChange) onOpacityChange(val / 100);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Flip Horizontal / Vertical */}
      <div className="canva-toolbar__group">
        <button
          type="button"
          onClick={onFlipHorizontal}
          title="Flip Horizontal"
        >
          <FlipHorizontal size={15} />
        </button>
        <button
          type="button"
          onClick={onFlipVertical}
          title="Flip Vertical"
        >
          <FlipVertical size={15} />
        </button>
      </div>

      {/* Layer Position Actions */}
      <div className="canva-toolbar__group">
        <button
          type="button"
          onClick={onBringForward}
          title="Bring Forward"
        >
          <BringToFront size={15} />
        </button>
        <button
          type="button"
          onClick={onSendBackward}
          title="Send Backward"
        >
          <SendToBack size={15} />
        </button>
      </div>

      {/* Lock / Unlock */}
      <button
        type="button"
        className={`canva-toolbar__icon-btn ${isLocked ? "active" : ""}`}
        onClick={isLocked ? onUnlock : onLock}
        title={isLocked ? "Unlock Object" : "Lock Object"}
      >
        {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
      </button>

      {/* Object Duplicate & Delete */}
      <div className="canva-toolbar__group">
        <button
          type="button"
          onClick={onDuplicate}
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          className="canva-toolbar__delete"
          onClick={onDelete}
          title="Delete (Del)"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default TopCanvasToolbar;
