import {
  BriefcaseBusiness,
  Clapperboard,
  Flower2,
  Gem,
  GraduationCap,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import "./StyleSelector.css";

const styleOptions = [
  {
    id: "luxury",
    name: "Luxury",
    description:
      "Premium gold and elegant lighting",
    icon: Gem,
    className:
      "style-option--orange",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description:
      "Dramatic spotlight and depth",
    icon: Clapperboard,
    className:
      "style-option--purple",
  },
  {
    id: "neon",
    name: "Neon",
    description:
      "Bright futuristic glow",
    icon: Zap,
    className:
      "style-option--pink",
  },
  {
    id: "floral",
    name: "Floral",
    description:
      "Soft flowers and elegance",
    icon: Flower2,
    className:
      "style-option--rose",
  },
  {
    id: "college",
    name: "College",
    description:
      "Young and colourful celebration",
    icon: GraduationCap,
    className:
      "style-option--cyan",
  },
  {
    id: "sports",
    name: "Sports",
    description:
      "Powerful energetic composition",
    icon: Trophy,
    className:
      "style-option--green",
  },
  {
    id: "magazine",
    name: "Magazine",
    description:
      "Editorial and professional",
    icon: BriefcaseBusiness,
    className:
      "style-option--blue",
  },
  {
    id: "futuristic",
    name: "Futuristic",
    description:
      "Digital and holographic",
    icon: Rocket,
    className:
      "style-option--violet",
  },
];

const moods = [
  "premium",
  "elegant",
  "energetic",
  "soft",
  "dramatic",
  "modern",
  "festive",
  "professional",
];

function StyleSelector({
  category,
  mood,
  onCategoryChange,
  onMoodChange,
}) {
  return (
    <section className="style-selector">
      <div className="style-selector__heading">
        <span>
          <Sparkles size={15} />
          Style Preference
        </span>

        <h3>
          Choose your poster direction
        </h3>

        <p>
          You can change the complete
          design again inside the editor.
        </p>
      </div>

      <div className="style-selector__grid">
        {styleOptions.map(
          ({
            id,
            name,
            description,
            icon: Icon,
            className,
          }) => (
            <button
              key={id}
              type="button"
              className={[
                "style-option",
                className,
                category === id
                  ? "style-option--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                onCategoryChange(id)
              }
            >
              <span className="style-option__icon">
                <Icon size={20} />
              </span>

              <span className="style-option__content">
                <strong>{name}</strong>
                <small>
                  {description}
                </small>
              </span>

              <span className="style-option__check">
                ✓
              </span>
            </button>
          )
        )}
      </div>

      <div className="style-selector__moods">
        <label>
          Design mood
        </label>

        <div className="style-selector__mood-list">
          {moods.map(
            (moodOption) => (
              <button
                key={moodOption}
                type="button"
                className={
                  mood === moodOption
                    ? "active"
                    : ""
                }
                onClick={() =>
                  onMoodChange(
                    moodOption
                  )
                }
              >
                {moodOption}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default StyleSelector;