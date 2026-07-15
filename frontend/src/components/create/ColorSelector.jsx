import {
  Palette,
  Sparkles,
} from "lucide-react";

import "./ColorSelector.css";

const colorPresets = [
  {
    name: "Orange Purple",
    primary: "#FF6B1A",
    secondary: "#7C3CFF",
  },
  {
    name: "Black Gold",
    primary: "#111111",
    secondary: "#D4AF37",
  },
  {
    name: "Royal Blue",
    primary: "#031B4E",
    secondary: "#2B7FFF",
  },
  {
    name: "Pink Rose",
    primary: "#FFF1F5",
    secondary: "#E15388",
  },
  {
    name: "Neon Purple",
    primary: "#160126",
    secondary: "#C13CFF",
  },
  {
    name: "Emerald Gold",
    primary: "#04271D",
    secondary: "#D8B85A",
  },
];

function ColorSelector({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
}) {
  const applyPreset = (
    preset
  ) => {
    onPrimaryChange(
      preset.primary
    );

    onSecondaryChange(
      preset.secondary
    );
  };

  return (
    <section className="color-selector">
      <div className="color-selector__heading">
        <span>
          <Palette size={15} />
          Colour Direction
        </span>

        <h3>
          Choose your colour palette
        </h3>
      </div>

      <div className="color-selector__presets">
        {colorPresets.map(
          (preset) => {
            const active =
              primaryColor ===
                preset.primary &&
              secondaryColor ===
                preset.secondary;

            return (
              <button
                key={preset.name}
                type="button"
                className={
                  active
                    ? "active"
                    : ""
                }
                onClick={() =>
                  applyPreset(preset)
                }
              >
                <span className="color-selector__swatches">
                  <i
                    style={{
                      background:
                        preset.primary,
                    }}
                  />

                  <i
                    style={{
                      background:
                        preset.secondary,
                    }}
                  />
                </span>

                <strong>
                  {preset.name}
                </strong>

                {active && (
                  <Sparkles
                    size={15}
                  />
                )}
              </button>
            );
          }
        )}
      </div>

      <div className="color-selector__custom">
        <label>
          <span>Primary colour</span>

          <div>
            <input
              type="color"
              value={primaryColor}
              onChange={(event) =>
                onPrimaryChange(
                  event.target.value
                )
              }
            />

            <strong>
              {primaryColor}
            </strong>
          </div>
        </label>

        <label>
          <span>
            Secondary colour
          </span>

          <div>
            <input
              type="color"
              value={secondaryColor}
              onChange={(event) =>
                onSecondaryChange(
                  event.target.value
                )
              }
            />

            <strong>
              {secondaryColor}
            </strong>
          </div>
        </label>
      </div>
    </section>
  );
}

export default ColorSelector;