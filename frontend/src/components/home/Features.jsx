import {
  Download,
  ImageOff,
  Layers3,
  Palette,
  ScanText,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

import "./Features.css";

const features = [
  {
    title: "AI Backgrounds",
    description:
      "Describe your preferred style and generate premium backgrounds instantly.",
    icon: WandSparkles,
    className: "feature-card--orange",
  },
  {
    title: "Background Removal",
    description:
      "Remove the student photo background and create a clean transparent portrait.",
    icon: ImageOff,
    className: "feature-card--purple",
  },
  {
    title: "Editable Layers",
    description:
      "Move, resize, rotate, duplicate and customise every poster element.",
    icon: Layers3,
    className: "feature-card--pink",
  },
  {
    title: "Poster Fonts",
    description:
      "Browse modern, bold, elegant, script and creative poster fonts.",
    icon: ScanText,
    className: "feature-card--cyan",
  },
  {
    title: "Colour Palettes",
    description:
      "Apply bright, luxury, minimal, neon and custom colour combinations.",
    icon: Palette,
    className: "feature-card--yellow",
  },
  {
    title: "High-Quality Export",
    description:
      "Download your completed design as PNG, JPEG, WebP or PDF.",
    icon: Download,
    className: "feature-card--green",
  },
];

function Features() {
  return (
    <section className="features section">
      <div className="page-container">
        <div className="section-heading">
          <span className="section-kicker">
            <Zap size={15} />
            Powerful Features
          </span>

          <h2 className="section-title">
            Everything needed to create a
            {" "}
            <span className="gradient-text">
              premium poster
            </span>
          </h2>

          <p className="section-description">
            SmartWish combines AI generation with
            complete manual editing control.
          </p>
        </div>

        <div className="features__grid">
          {features.map(
            ({
              title,
              description,
              icon: Icon,
              className,
            }) => (
              <article
                key={title}
                className={`feature-card ${className}`}
              >
                <div className="feature-card__icon">
                  <Icon size={25} />
                </div>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <Sparkles
                  className="feature-card__sparkle"
                  size={20}
                />
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default Features;