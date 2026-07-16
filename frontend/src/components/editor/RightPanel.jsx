import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Copy,
  Layers3,
  Lock,
  Move,
  RotateCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import "./RightPanel.css";

function RightPanel({
  selectedObject,
  onDelete,
  onDuplicate,
}) {
  return (
    <aside className="editor-right-panel">
      <div className="editor-right-panel__header">
        <div>
          <SlidersHorizontal
            size={18}
          />

          <div>
            <h3>Properties</h3>
            <p>
              Edit the selected object
            </p>
          </div>
        </div>
      </div>

      {!selectedObject ? (
        <div className="editor-right-panel__empty">
          <Move size={32} />

          <h4>Select an element</h4>

          <p>
            Click any text, image or shape
            on the poster to edit its
            properties.
          </p>
        </div>
      ) : (
        <div className="editor-right-panel__content">
          <section className="property-group">
            <div className="property-group__title">
              <span>Selected layer</span>
              <Layers3 size={15} />
            </div>

            <button
              type="button"
              className="property-layer-button"
            >
              <span>
                {selectedObject.name ||
                  "Poster element"}
              </span>

              <ChevronDown size={16} />
            </button>
          </section>

          <section className="property-group">
            <div className="property-group__title">
              <span>Position</span>
              <Move size={15} />
            </div>

            <div className="property-number-grid">
              <label>
                <span>X</span>
                <input
                  type="number"
                  defaultValue="100"
                />
              </label>

              <label>
                <span>Y</span>
                <input
                  type="number"
                  defaultValue="100"
                />
              </label>
            </div>
          </section>

          <section className="property-group">
            <div className="property-group__title">
              <span>Size</span>
              <Lock size={15} />
            </div>

            <div className="property-number-grid">
              <label>
                <span>W</span>
                <input
                  type="number"
                  defaultValue="300"
                />
              </label>

              <label>
                <span>H</span>
                <input
                  type="number"
                  defaultValue="300"
                />
              </label>
            </div>
          </section>

          <section className="property-group">
            <div className="property-group__title">
              <span>Rotation</span>
              <RotateCw size={15} />
            </div>

            <div className="property-range">
              <input
                type="range"
                min="-180"
                max="180"
                defaultValue="0"
              />

              <span>0°</span>
            </div>
          </section>

          <section className="property-group">
            <div className="property-group__title">
              <span>Alignment</span>
            </div>

            <div className="property-alignment">
              <button type="button">
                <AlignLeft size={18} />
              </button>

              <button
                type="button"
                className="active"
              >
                <AlignCenter size={18} />
              </button>

              <button type="button">
                <AlignRight size={18} />
              </button>
            </div>
          </section>

          <section className="property-group">
            <div className="property-group__title">
              <span>Opacity</span>
            </div>

            <div className="property-range">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="100"
              />

              <span>100%</span>
            </div>
          </section>

          <div className="editor-right-panel__actions">
            <button
              type="button"
              onClick={onDuplicate}
            >
              <Copy size={17} />
              Duplicate
            </button>

            <button
              type="button"
              onClick={onDelete}
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default RightPanel;