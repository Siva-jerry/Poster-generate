import {
  ArrowUpRight,
  Crown,
  Eye,
  Heart,
  ImageIcon,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import "./TemplateCard.css";

function TemplateCard({
  template,
  previewUrl,
  favourite,
  onFavourite,
  onUseTemplate,
  onPreview,
}) {
  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const palette =
    template.design?.palette;

  const gradientColors =
    template.preview?.gradient
      ?.colors ||
    palette?.gradient?.colors ||
    [
      palette?.colors?.background ||
        "#111111",

      palette?.colors
        ?.backgroundSecondary ||
        "#FF6B1A",
    ];

  const fallbackBackground = {
    background: `linear-gradient(
      145deg,
      ${gradientColors[0]},
      ${
        gradientColors[
          Math.floor(
            gradientColors.length /
              2
          )
        ] || gradientColors[0]
      },
      ${
        gradientColors[
          gradientColors.length - 1
        ]
      }
    )`,
  };

  const category =
    template.categories?.[0] ||
    template.category ||
    "Premium";

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
                alt={`${template.name} template preview`}
                loading="lazy"
                onLoad={() =>
                  setImageLoaded(
                    true
                  )
                }
                onError={() =>
                  setImageFailed(
                    true
                  )
                }
              />
            </>
          )}

        {(!previewUrl ||
          imageFailed) && (
          <div className="template-card__fallback">
            <Sparkles
              size={24}
            />

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
            onClick={(event) => {
              event.stopPropagation();
              onFavourite(
                template.id
              );
            }}
            aria-label={
              favourite
                ? "Remove favourite"
                : "Add favourite"
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
            onClick={() =>
              onPreview(template)
            }
          >
            <Eye size={17} />
            Preview
          </button>

          <button
            type="button"
            onClick={() =>
              onUseTemplate(
                template
              )
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
          <h3>
            {template.name}
          </h3>

          <p>
            {category}
            {" · "}
            {
              template.design?.layout
                ?.name
            }
          </p>
        </div>

        <span
          className="template-card__palette"
          title={
            palette?.name ||
            "Colour palette"
          }
        >
          <i
            style={{
              background:
                palette?.colors
                  ?.background ||
                "#111111",
            }}
          />

          <i
            style={{
              background:
                palette?.colors
                  ?.primary ||
                "#FF6B1A",
            }}
          />

          <i
            style={{
              background:
                palette?.colors
                  ?.secondary ||
                "#FFFFFF",
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