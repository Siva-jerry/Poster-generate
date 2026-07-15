import {
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import "./FilterPanel.css";

function FilterPanel({
  filters,
  selectedPalette,
  selectedLayout,
  selectedSort,
  onPaletteChange,
  onLayoutChange,
  onSortChange,
  onReset,
}) {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const palettes =
    filters?.palettes || [];

  const layouts =
    filters?.layouts || [];

  const activeFilterCount = [
    selectedPalette !== "all",
    selectedLayout !== "all",
    selectedSort !==
      "trending",
  ].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        className="filter-panel__mobile-button"
        onClick={() =>
          setMobileOpen(true)
        }
      >
        <SlidersHorizontal
          size={18}
        />

        Filters

        {activeFilterCount > 0 && (
          <span>
            {activeFilterCount}
          </span>
        )}
      </button>

      <aside
        className={[
          "filter-panel",
          mobileOpen
            ? "filter-panel--open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="filter-panel__mobile-header">
          <div>
            <Filter size={19} />
            <strong>Filters</strong>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="filter-panel__heading">
          <div>
            <Filter size={18} />

            <div>
              <h3>
                Refine templates
              </h3>

              <p>
                Choose the design
                components you prefer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <label className="filter-group">
          <span>
            Sort templates
          </span>

          <div className="filter-select">
            <select
              value={selectedSort}
              onChange={(event) =>
                onSortChange(
                  event.target.value
                )
              }
            >
              <option value="trending">
                Trending
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="name">
                Name A–Z
              </option>
            </select>

            <ChevronDown
              size={17}
            />
          </div>
        </label>

        <label className="filter-group">
          <span>
            Poster layout
          </span>

          <div className="filter-select">
            <select
              value={selectedLayout}
              onChange={(event) =>
                onLayoutChange(
                  event.target.value
                )
              }
            >
              <option value="all">
                All layouts
              </option>

              {layouts.map(
                (layout) => (
                  <option
                    key={layout.id}
                    value={layout.id}
                  >
                    {layout.name}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={17}
            />
          </div>
        </label>

        <div className="filter-group">
          <span>
            Colour palette
          </span>

          <div className="filter-palettes">
            <button
              type="button"
              className={
                selectedPalette ===
                "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onPaletteChange(
                  "all"
                )
              }
            >
              <i className="filter-palettes__all" />
              <strong>
                All colours
              </strong>
            </button>

            {palettes.map(
              (palette) => (
                <button
                  key={palette.id}
                  type="button"
                  className={
                    selectedPalette ===
                    palette.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    onPaletteChange(
                      palette.id
                    )
                  }
                >
                  <span className="filter-palette-swatches">
                    <i
                      style={{
                        background:
                          palette
                            .colors
                            ?.background ||
                          "#111111",
                      }}
                    />

                    <i
                      style={{
                        background:
                          palette
                            .colors
                            ?.primary ||
                          "#FF6B1A",
                      }}
                    />
                  </span>

                  <strong>
                    {palette.name}
                  </strong>
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          className="filter-panel__apply"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          Show templates
        </button>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="filter-panel__backdrop"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}
    </>
  );
}

export default FilterPanel;