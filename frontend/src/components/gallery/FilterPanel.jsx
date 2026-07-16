import {
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useState } from "react";

import "./FilterPanel.css";

function getSafeText(
  value,
  fallback
) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return fallback;
}

function getSafeId(
  item,
  index,
  prefix
) {
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  if (
    item &&
    typeof item === "object"
  ) {
    const possibleId =
      item.id ??
      item.slug ??
      item.key;

    if (
      typeof possibleId === "string" ||
      typeof possibleId === "number"
    ) {
      return String(possibleId);
    }
  }

  return `${prefix}-${index}`;
}

function getSafeName(
  item,
  index,
  prefix
) {
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  if (
    item &&
    typeof item === "object"
  ) {
    const possibleName =
      item.name ??
      item.label ??
      item.title ??
      item.displayName;

    return getSafeText(
      possibleName,
      `${prefix} ${index + 1}`
    );
  }

  return `${prefix} ${index + 1}`;
}

function getPaletteColor(
  palette,
  colorName,
  fallback
) {
  const value =
    palette?.colors?.[colorName];

  return typeof value === "string"
    ? value
    : fallback;
}

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

  const palettes = Array.isArray(
    filters?.palettes
  )
    ? filters.palettes
    : [];

  const layouts = Array.isArray(
    filters?.layouts
  )
    ? filters.layouts
    : [];

  const activeFilterCount = [
    selectedPalette !== "all",
    selectedLayout !== "all",
    selectedSort !== "trending",
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

            <strong>
              Filters
            </strong>
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
                (layout, index) => {
                  const layoutId =
                    getSafeId(
                      layout,
                      index,
                      "layout"
                    );

                  const layoutName =
                    getSafeName(
                      layout,
                      index,
                      "Layout"
                    );

                  return (
                    <option
                      key={layoutId}
                      value={layoutId}
                    >
                      {layoutName}
                    </option>
                  );
                }
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
              (
                palette,
                index
              ) => {
                const paletteId =
                  getSafeId(
                    palette,
                    index,
                    "palette"
                  );

                const paletteName =
                  getSafeName(
                    palette,
                    index,
                    "Palette"
                  );

                const backgroundColor =
                  getPaletteColor(
                    palette,
                    "background",
                    "#111111"
                  );

                const primaryColor =
                  getPaletteColor(
                    palette,
                    "primary",
                    "#FF6B1A"
                  );

                return (
                  <button
                    key={paletteId}
                    type="button"
                    className={
                      selectedPalette ===
                      paletteId
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      onPaletteChange(
                        paletteId
                      )
                    }
                  >
                    <span className="filter-palette-swatches">
                      <i
                        style={{
                          background:
                            backgroundColor,
                        }}
                      />

                      <i
                        style={{
                          background:
                            primaryColor,
                        }}
                      />
                    </span>

                    <strong>
                      {paletteName}
                    </strong>
                  </button>
                );
              }
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