import {
  BriefcaseBusiness,
  Clapperboard,
  Flower2,
  Gem,
  GraduationCap,
  Grid2X2,
  Rocket,
  Trophy,
  Zap,
} from "lucide-react";

import "./CategoryTabs.css";

const categoryItems = [
  {
    id: "all",
    label: "All",
    icon: Grid2X2,
  },
  {
    id: "luxury",
    label: "Luxury",
    icon: Gem,
  },
  {
    id: "cinematic",
    label: "Cinematic",
    icon: Clapperboard,
  },
  {
    id: "neon",
    label: "Neon",
    icon: Zap,
  },
  {
    id: "floral",
    label: "Floral",
    icon: Flower2,
  },
  {
    id: "college",
    label: "College",
    icon: GraduationCap,
  },
  {
    id: "sports",
    label: "Sports",
    icon: Trophy,
  },
  {
    id: "magazine",
    label: "Magazine",
    icon: BriefcaseBusiness,
  },
  {
    id: "futuristic",
    label: "Future",
    icon: Rocket,
  },
];

function CategoryTabs({
  activeCategory,
  onChange,
}) {
  return (
    <div className="category-tabs">
      {categoryItems.map(
        ({
          id,
          label,
          icon: Icon,
        }) => (
          <button
            key={id}
            type="button"
            className={
              activeCategory === id
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(id)
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        )
      )}
    </div>
  );
}

export default CategoryTabs;