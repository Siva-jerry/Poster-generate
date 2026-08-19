import React, { useState, useEffect } from "react";
import { Layers, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Trash2, Type, Image as ImageIcon, Shapes, Sparkles } from "lucide-react";
import "./LayersPanel.css";

function getObjectIcon(type) {
  if (type === "text" || type === "i-text" || type === "textbox") return Type;
  if (type === "image" || type === "fabric-image") return ImageIcon;
  if (type === "group") return Shapes;
  return Sparkles;
}

function getObjectLabel(obj) {
  if (obj.text) {
    const text = obj.text.trim();
    return text.length > 22 ? `${text.slice(0, 22)}...` : text;
  }
  if (obj.type === "image" || obj.type === "fabric-image") return "Photo / Image";
  if (obj.type === "rect") return "Frame / Box";
  if (obj.type === "circle") return "Circle Shape";
  if (obj.type === "group") return "Graphic Element";
  return obj.type ? obj.type.toUpperCase() : "Canvas Layer";
}

function LayersPanel({ canvas, onSelectObject }) {
  const [layers, setLayers] = useState([]);
  const [activeObj, setActiveObj] = useState(null);

  const refreshLayers = () => {
    if (!canvas) return;
    const objects = canvas.getObjects() || [];
    // Show top layers first (reverse order)
    setLayers([...objects].reverse());
    setActiveObj(canvas.getActiveObject());
  };

  useEffect(() => {
    refreshLayers();
    if (!canvas) return;

    const handleUpdate = () => refreshLayers();
    canvas.on("selection:created", handleUpdate);
    canvas.on("selection:updated", handleUpdate);
    canvas.on("selection:cleared", handleUpdate);
    canvas.on("object:added", handleUpdate);
    canvas.on("object:removed", handleUpdate);
    canvas.on("object:modified", handleUpdate);

    return () => {
      canvas.off("selection:created", handleUpdate);
      canvas.off("selection:updated", handleUpdate);
      canvas.off("selection:cleared", handleUpdate);
      canvas.off("object:added", handleUpdate);
      canvas.off("object:removed", handleUpdate);
      canvas.off("object:modified", handleUpdate);
    };
  }, [canvas]);

  const handleSelect = (obj) => {
    if (!canvas || !obj) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setActiveObj(obj);
    if (onSelectObject) onSelectObject(obj);
  };

  const handleMoveUp = (obj, e) => {
    e.stopPropagation();
    if (!canvas || !obj) return;
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
    refreshLayers();
  };

  const handleMoveDown = (obj, e) => {
    e.stopPropagation();
    if (!canvas || !obj) return;
    canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
    refreshLayers();
  };

  const handleToggleLock = (obj, e) => {
    e.stopPropagation();
    if (!canvas || !obj) return;
    const isLocked = obj.lockMovementX && obj.lockMovementY;
    obj.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      hasControls: isLocked,
    });
    canvas.requestRenderAll();
    refreshLayers();
  };

  const handleDelete = (obj, e) => {
    e.stopPropagation();
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    refreshLayers();
  };

  return (
    <div className="layers-panel">
      <div className="layers-panel__header">
        <Layers size={18} className="layers-panel__icon" />
        <span>Canvas Layers ({layers.length})</span>
      </div>

      <div className="layers-panel__list">
        {layers.length === 0 ? (
          <div className="layers-panel__empty">
            <span>No layers on the canvas yet.</span>
          </div>
        ) : (
          layers.map((obj, index) => {
            const Icon = getObjectIcon(obj.type);
            const label = getObjectLabel(obj);
            const isSelected = activeObj === obj;
            const isLocked = obj.lockMovementX && obj.lockMovementY;

            return (
              <div
                key={obj.id || index}
                className={`layers-panel__item ${isSelected ? "active" : ""}`}
                onClick={() => handleSelect(obj)}
              >
                <div className="layers-panel__item-info">
                  <Icon size={16} className="layers-panel__type-icon" />
                  <span className="layers-panel__label">{label}</span>
                </div>

                <div className="layers-panel__actions">
                  <button
                    type="button"
                    title="Bring Forward"
                    onClick={(e) => handleMoveUp(obj, e)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    title="Send Backward"
                    onClick={(e) => handleMoveDown(obj, e)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    title={isLocked ? "Unlock Layer" : "Lock Layer"}
                    className={isLocked ? "locked" : ""}
                    onClick={(e) => handleToggleLock(obj, e)}
                  >
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button
                    type="button"
                    title="Delete Layer"
                    className="delete"
                    onClick={(e) => handleDelete(obj, e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LayersPanel;
