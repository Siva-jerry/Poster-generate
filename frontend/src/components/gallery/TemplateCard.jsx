import {
  ArrowUpRight,
  Crown,
  Eye,
  Heart,
  ImageIcon,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";

import "./TemplateCard.css";

/*
|--------------------------------------------------------------------------
| Convert any value into safe display text
|--------------------------------------------------------------------------
*/

function getSafeText(value, fallback = "") {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return fallback;
}

/*
|--------------------------------------------------------------------------
| Get safe template name
|--------------------------------------------------------------------------
*/

function getTemplateName(template) {
  return getSafeText(
    template?.name,
    getSafeText(
      template?.title,
      "Premium Birthday Design"
    )
  );
}

/*
|--------------------------------------------------------------------------
| Get safe category name
|--------------------------------------------------------------------------
*/

function getCategoryName(template) {
  const categories = template?.categories;

  if (
    Array.isArray(categories) &&
    categories.length > 0
  ) {
    const firstCategory = categories[0];

    if (
      typeof firstCategory === "string" ||
      typeof firstCategory === "number"
    ) {
      return String(firstCategory);
    }

    if (
      firstCategory &&
      typeof firstCategory === "object"
    ) {
      return getSafeText(
        firstCategory.name ??
          firstCategory.label ??
          firstCategory.title,
        "Premium"
      );
    }
  }

  const category = template?.category;

  if (
    typeof category === "string" ||
    typeof category === "number"
  ) {
    return String(category);
  }

  if (
    category &&
    typeof category === "object"
  ) {
    return getSafeText(
      category.name ??
        category.label ??
        category.title,
      "Premium"
    );
  }

  return "Premium";
}

/*
|--------------------------------------------------------------------------
| Get safe layout name
|--------------------------------------------------------------------------
*/

function getLayoutName(template) {
  const layout =
    template?.design?.layout ??
    template?.layout;

  if (
    typeof layout === "string" ||
    typeof layout === "number"
  ) {
    return String(layout);
  }

  if (
    !layout ||
    typeof layout !== "object"
  ) {
    return "Custom Layout";
  }

  /*
   * Only accept text values.
   *
   * Never return objects such as:
   * { x, y, width, align }
   */
  const possibleName =
    layout.displayName ??
    layout.label ??
    layout.title ??
    layout.id ??
    layout.slug;

  if (
    typeof possibleName === "string" ||
    typeof possibleName === "number"
  ) {
    return String(possibleName);
  }

  /*
   * layout.name may itself be a position object.
   */
  if (
    typeof layout.name === "string" ||
    typeof layout.name === "number"
  ) {
    return String(layout.name);
  }

  return "Custom Layout";
}

/*
|--------------------------------------------------------------------------
| Get safe palette information
|--------------------------------------------------------------------------
*/

function getPalette(template) {
  const palette =
    template?.design?.palette ??
    template?.palette ??
    {};

  return palette &&
    typeof palette === "object"
    ? palette
    : {};
}

function getPaletteName(palette) {
  return getSafeText(
    palette?.name ??
      palette?.label ??
      palette?.title,
    "Colour Palette"
  );
}

function getPaletteColor(
  palette,
  key,
  fallback
) {
  const color =
    palette?.colors?.[key];

  return typeof color === "string"
    ? color
    : fallback;
}

/*
|--------------------------------------------------------------------------
| Get preview gradient colours
|--------------------------------------------------------------------------
*/

function getGradientColors(
  template,
  palette
) {
  const previewColors =
    template?.preview?.gradient?.colors;

  const paletteColors =
    palette?.gradient?.colors;

  const source =
    Array.isArray(previewColors) &&
    previewColors.length > 0
      ? previewColors
      : Array.isArray(paletteColors) &&
          paletteColors.length > 0
        ? paletteColors
        : [];

  const safeColors = source.filter(
    (color) =>
      typeof color === "string" &&
      color.trim()
  );

  if (safeColors.length >= 2) {
    return safeColors;
  }

  return [
    getPaletteColor(
      palette,
      "background",
      "#15121C"
    ),

    getPaletteColor(
      palette,
      "primary",
      "#FF6B1A"
    ),

    getPaletteColor(
      palette,
      "secondary",
      "#7C3CFF"
    ),
  ];
}

function TemplateCard({
  template,
  previewUrl,
  favourite = false,
  onFavourite,
  onUseTemplate,
  onPreview,
}) {
  const [imageLoaded, setImageLoaded] =
    useState(false);

  const [imageFailed, setImageFailed] =
    useState(false);

  /*
   * Reset image state when preview URL changes.
   */
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [previewUrl]);

  const templateId =
    getSafeText(
      template?.id,
      `template-${Date.now()}`
    );

  const templateName =
    getTemplateName(template);

  const categoryName =
    getCategoryName(template);

  const layoutName =
    getLayoutName(template);

  const palette =
    getPalette(template);

  const paletteName =
    getPaletteName(palette);

  const gradientColors =
    getGradientColors(
      template,
      palette
    );

  const firstColor =
    gradientColors[0] ||
    "#15121C";

  const middleColor =
    gradientColors[
      Math.floor(
        gradientColors.length / 2
      )
    ] || "#FF6B1A";

  const lastColor =
    gradientColors[
      gradientColors.length - 1
    ] || "#7C3CFF";

  const fallbackBackground = {
    background: `linear-gradient(
      145deg,
      ${firstColor},
      ${middleColor},
      ${lastColor}
    )`,
  };

  const handleFavourite = (
    event
  ) => {
    event.stopPropagation();

    if (
      typeof onFavourite ===
      "function"
    ) {
      onFavourite(templateId);
    }
  };

  const handlePreview = () => {
    if (
      typeof onPreview ===
      "function"
    ) {
      onPreview(template);
    }
  };

  const handleUseTemplate = () => {
    if (
      typeof onUseTemplate ===
      "function"
    ) {
      onUseTemplate(template);
    }
  };

  return (
    <article className="template-card">
      <div
        className="template-card__preview"
        style={
          !previewUrl ||
          imageFailed
            ? fallbackBackground
            : undefined
        }
      >
        {previewUrl &&
          !imageFailed && (
            <>
              {!imageLoaded && (
                <div className="template-card__image-loader">
                  <LoaderCircle
                    size={25}
                  />
                </div>
              )}

              <img
                src={previewUrl}
                alt={`${templateName} template preview`}
                loading="lazy"
                onLoad={() =>
                  setImageLoaded(true)
                }
                onError={() => {
                  setImageLoaded(false);
                  setImageFailed(true);
                }}
              />
            </>
          )}

        {(!previewUrl ||
          imageFailed) && (
          <div className="template-card__fallback">
            <Sparkles size={24} />

            <strong>
              HAPPY BIRTHDAY
            </strong>

            <div className="template-card__fallback-person">
              <span />
              <span />
            </div>

            <small>
              Preview preparing
            </small>
          </div>
        )}

        <div className="template-card__top">
          <span className="template-card__premium">
            <Crown size={13} />
            Premium
          </span>

          <button
            type="button"
            className={[
              "template-card__favourite",
              favourite
                ? "active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={
              handleFavourite
            }
            aria-label={
              favourite
                ? `Remove ${templateName} from favourites`
                : `Add ${templateName} to favourites`
            }
          >
            <Heart
              size={17}
              fill={
                favourite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        </div>

        <div className="template-card__actions">
          <button
            type="button"
            onClick={
              handlePreview
            }
          >
            <Eye size={17} />
            Preview
          </button>

          <button
            type="button"
            onClick={
              handleUseTemplate
            }
          >
            Use design

            <ArrowUpRight
              size={17}
            />
          </button>
        </div>
      </div>

      <div className="template-card__details">
        <div>
          <h3 title={templateName}>
            {templateName}
          </h3>

          <p>
            {categoryName}
            {" · "}
            {layoutName}
          </p>
        </div>

        <span
          className="template-card__palette"
          title={paletteName}
        >
          <i
            style={{
              background:
                getPaletteColor(
                  palette,
                  "background",
                  "#111111"
                ),
            }}
          />

          <i
            style={{
              background:
                getPaletteColor(
                  palette,
                  "primary",
                  "#FF6B1A"
                ),
            }}
          />

          <i
            style={{
              background:
                getPaletteColor(
                  palette,
                  "secondary",
                  "#FFFFFF"
                ),
            }}
          />
        </span>
      </div>

      {!previewUrl && (
        <div className="template-card__preview-state">
          <ImageIcon size={14} />

          Preview is being generated
        </div>
      )}
    </article>
  );
}

export default TemplateCard;