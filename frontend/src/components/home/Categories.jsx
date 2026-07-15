import {
  BriefcaseBusiness,
  Clapperboard,
  Flower2,
  Gem,
  GraduationCap,
  Heart,
  LayoutGrid,
  PartyPopper,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Categories.css";

const categories = [
  {
    id: "luxury",
    name: "Luxury",
    description: "Gold, premium and elegant",
    icon: Gem,
    className: "category-card--orange",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Dramatic light and depth",
    icon: Clapperboard,
    className: "category-card--purple",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Colourful futuristic glow",
    icon: Zap,
    className: "category-card--pink",
  },
  {
    id: "floral",
    name: "Floral",
    description: "Soft flowers and elegance",
    icon: Flower2,
    className: "category-card--rose",
  },
  {
    id: "college",
    name: "College",
    description: "Youthful campus celebration",
    icon: GraduationCap,
    className: "category-card--cyan",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Bold and energetic designs",
    icon: Trophy,
    className: "category-card--green",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Clean and modern layouts",
    icon: BriefcaseBusiness,
    className: "category-card--blue",
  },
  {
    id: "futuristic",
    name: "Futuristic",
    description: "Holographic modern style",
    icon: Rocket,
    className: "category-card--violet",
  },
];

function Categories() {
  return (
    <section className="categories section">
      <div className="page-container">
        <div className="section-heading">
          <span className="section-kicker">
            <LayoutGrid size={15} />
            Design Categories
          </span>

          <h2 className="section-title">
            Pick a style that matches
            {" "}
            <span className="gradient-text">
              every personality
            </span>
          </h2>

          <p className="section-description">
            Explore colourful, premium and modern
            poster categories created for different
            moods and celebrations.
          </p>
        </div>

        <div className="categories__grid">
          {categories.map(
            ({
              id,
              name,
              description,
              icon: Icon,
              className,
            }) => (
              <Link
                key={id}
                to={`/templates?category=${id}`}
                className={`category-card ${className}`}
              >
                <span className="category-card__shape" />

                <div className="category-card__icon">
                  <Icon size={25} />
                </div>

                <div className="category-card__content">
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>

                <Sparkles
                  className="category-card__sparkle"
                  size={18}
                />
              </Link>
            )
          )}
        </div>

        <div className="categories__note">
          <PartyPopper size={19} />

          <span>
            New categories and AI styles are added
            continuously.
          </span>

          <Heart
            size={17}
            fill="currentColor"
          />
        </div>
      </div>
    </section>
  );
}

export default Categories;