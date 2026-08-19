import React, { useState } from "react";
import { Search, Sparkles, Shapes, Crown, Gift, Cake, Flag, Heart, Star, Award } from "lucide-react";
import "./ElementsPanel.css";

const ELEMENT_CATEGORIES = [
  { id: "all", label: "All Elements", icon: Shapes },
  { id: "balloons", label: "Balloons", icon: Heart },
  { id: "cakes", label: "Cakes", icon: Cake },
  { id: "crowns", label: "Crowns & Badges", icon: Crown },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "sparkles", label: "Sparkles & Stars", icon: Sparkles },
  { id: "banners", label: "Banners & Ribbons", icon: Flag },
  { id: "shapes", label: "Shapes", icon: Star },
];

const CELEBRATION_ELEMENTS = [
  // --- Balloons ---
  {
    id: "gold-balloons",
    title: "Gold 3D Balloon Bouquet",
    category: "balloons",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gbg1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFF9D2"/>
          <stop offset="45%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#7A5805"/>
        </radialGradient>
        <radialGradient id="gbg2" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="40%" stop-color="#FFDF73"/>
          <stop offset="100%" stop-color="#996E00"/>
        </radialGradient>
      </defs>
      <ellipse cx="45" cy="50" rx="32" ry="40" fill="url(#gbg1)"/>
      <ellipse cx="78" cy="58" rx="28" ry="36" fill="url(#gbg2)"/>
      <ellipse cx="36" cy="40" rx="9" ry="14" fill="#FFFFFF" opacity="0.6"/>
      <ellipse cx="72" cy="48" rx="8" ry="12" fill="#FFFFFF" opacity="0.6"/>
      <path d="M 45 90 Q 40 110 50 135" stroke="#D4AF37" stroke-width="2.5" fill="none"/>
      <path d="M 78 94 Q 82 112 60 135" stroke="#D4AF37" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    id: "rose-balloons",
    title: "Rose Gold Balloon Bundle",
    category: "balloons",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rbg1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFE4EE"/>
          <stop offset="45%" stop-color="#FF4D79"/>
          <stop offset="100%" stop-color="#800A28"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="32" ry="40" fill="url(#rbg1)"/>
      <ellipse cx="78" cy="60" rx="26" ry="34" fill="url(#rbg1)"/>
      <ellipse cx="40" cy="40" rx="9" ry="14" fill="#FFFFFF" opacity="0.6"/>
      <path d="M 50 90 Q 45 110 55 135" stroke="#FF7597" stroke-width="2.5" fill="none"/>
    </svg>`,
  },
  {
    id: "neon-cyan-balloons",
    title: "Electric Cyan Balloon",
    category: "balloons",
    svg: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cbg1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#E0FFFF"/>
          <stop offset="45%" stop-color="#00F2FE"/>
          <stop offset="100%" stop-color="#034B6E"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="48" rx="34" ry="42" fill="url(#cbg1)"/>
      <ellipse cx="40" cy="38" rx="10" ry="15" fill="#FFFFFF" opacity="0.65"/>
      <path d="M 50 90 Q 48 108 52 125" stroke="#00F2FE" stroke-width="2.5" fill="none"/>
    </svg>`,
  },

  // --- Cakes ---
  {
    id: "birthday-cake-luxury",
    title: "2-Tier Golden Velvet Cake",
    category: "cakes",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cakeGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#D4AF37"/>
          <stop offset="50%" stop-color="#FFF5C0"/>
          <stop offset="100%" stop-color="#AA8010"/>
        </linearGradient>
      </defs>
      <rect x="20" y="65" width="80" height="42" rx="8" fill="url(#cakeGold)"/>
      <ellipse cx="60" cy="65" rx="40" ry="10" fill="#FFF5C0"/>
      <rect x="35" y="36" width="50" height="30" rx="6" fill="url(#cakeGold)"/>
      <ellipse cx="60" cy="36" rx="25" ry="7" fill="#FFF5C0"/>
      <rect x="58" y="16" width="4" height="20" fill="#FFFFFF"/>
      <circle cx="60" cy="12" r="6" fill="#FF7A00"/>
      <circle cx="60" cy="12" r="3" fill="#FFF5C0"/>
    </svg>`,
  },
  {
    id: "cupcake-sparkle",
    title: "Celebration Cupcake",
    category: "cakes",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 25 55 L 32 90 L 68 90 L 75 55 Z" fill="#D4AF37"/>
      <ellipse cx="50" cy="55" rx="30" ry="16" fill="#FF4D79"/>
      <circle cx="50" cy="40" r="14" fill="#FFE0EC"/>
      <rect x="48" y="18" width="4" height="18" fill="#FFFFFF"/>
      <circle cx="50" cy="14" r="5" fill="#FF7A00"/>
    </svg>`,
  },

  // --- Crowns & Badges ---
  {
    id: "royal-crown",
    title: "Royal Imperial Gold Crown",
    category: "crowns",
    svg: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF5C0"/>
          <stop offset="40%" stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#996E00"/>
        </linearGradient>
      </defs>
      <path d="M 15 70 L 24 25 L 44 48 L 60 14 L 76 48 L 96 25 L 105 70 Z" fill="url(#crownGrad)"/>
      <rect x="15" y="70" width="90" height="14" rx="4" fill="#7A5805"/>
      <circle cx="60" cy="14" r="6" fill="#FFFFFF"/>
      <circle cx="24" cy="25" r="5" fill="#FFFFFF"/>
      <circle cx="96" cy="25" r="5" fill="#FFFFFF"/>
      <circle cx="60" cy="77" r="4" fill="#FF3864"/>
      <circle cx="38" cy="77" r="4" fill="#00F2FE"/>
      <circle cx="82" cy="77" r="4" fill="#00F2FE"/>
    </svg>`,
  },
  {
    id: "laurel-crest",
    title: "Golden Laurel Victory Wreath",
    category: "crowns",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laurelGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFDF73"/>
          <stop offset="50%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#8A6B0A"/>
        </linearGradient>
      </defs>
      <path d="M 40 100 C 10 80 5 35 40 15" stroke="url(#laurelGold)" stroke-width="5" fill="none"/>
      <path d="M 80 100 C 110 80 115 35 80 15" stroke="url(#laurelGold)" stroke-width="5" fill="none"/>
      <polygon points="60,15 64,25 75,25 66,31 69,41 60,35 51,41 54,31 45,25 56,25" fill="#FFD700"/>
    </svg>`,
  },
  {
    id: "vip-shield-badge",
    title: "VIP Honors Crest Badge",
    category: "crowns",
    svg: `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 10 L 85 24 L 85 65 C 85 90 50 105 50 105 C 50 105 15 90 15 65 L 15 24 Z" fill="#D4AF37" stroke="#FFF5C0" stroke-width="3"/>
      <path d="M 50 20 L 76 31 L 76 62 C 76 80 50 94 50 94 C 50 94 24 80 24 62 L 24 31 Z" fill="#0A0A0E"/>
      <text x="50" y="64" font-family="Arial" font-size="18" font-weight="900" fill="#FFD700" text-anchor="middle">VIP</text>
    </svg>`,
  },

  // --- Gifts ---
  {
    id: "gift-box-luxury",
    title: "3D Wrapped Gold Gift Box",
    category: "gifts",
    svg: `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="60" height="54" rx="8" fill="#D4AF37"/>
      <rect x="20" y="32" width="70" height="16" rx="5" fill="#8A6B0A"/>
      <rect x="50" y="32" width="10" height="67" fill="#FF3864"/>
      <ellipse cx="44" cy="24" rx="12" ry="7" fill="#FF3864" transform="rotate(-30 44 24)"/>
      <ellipse cx="66" cy="24" rx="12" ry="7" fill="#FF3864" transform="rotate(30 66 24)"/>
    </svg>`,
  },

  // --- Sparkles & Stars ---
  {
    id: "starburst-flare",
    title: "Diamond Starburst Sparkle",
    category: "sparkles",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 60 10 Q 60 60 110 60 Q 60 60 60 110 Q 60 60 10 60 Q 60 60 60 10 Z" fill="#FFD700"/>
      <path d="M 60 25 Q 60 60 95 60 Q 60 60 60 95 Q 60 60 25 60 Q 60 60 60 25 Z" fill="#FFFFFF"/>
      <circle cx="60" cy="60" r="10" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: "sparkle-cluster",
    title: "Celestial Star Cluster",
    category: "sparkles",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 15 Q 40 35 60 35 Q 40 35 40 55 Q 40 35 20 35 Q 40 35 40 15 Z" fill="#FFD700"/>
      <path d="M 85 45 Q 85 60 100 60 Q 85 60 85 75 Q 85 60 70 60 Q 85 60 85 45 Z" fill="#00F2FE"/>
      <path d="M 50 75 Q 50 90 65 90 Q 50 90 50 105 Q 50 90 35 90 Q 50 90 50 75 Z" fill="#FF3864"/>
    </svg>`,
  },

  // --- Banners & Ribbons ---
  {
    id: "party-bunting",
    title: "Celebration Banner Flags",
    category: "banners",
    svg: `<svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 12 Q 70 32 140 12" stroke="#E2E8F0" stroke-width="2.5" fill="none"/>
      <polygon points="10,15 35,20 22,55" fill="#FF3864"/>
      <polygon points="40,21 65,24 52,58" fill="#D4AF37"/>
      <polygon points="70,24 95,21 82,58" fill="#00F2FE"/>
      <polygon points="100,20 125,15 112,55" fill="#38EF7D"/>
    </svg>`,
  },
  {
    id: "gold-ribbon-banner",
    title: "Curved Gold Title Ribbon",
    category: "banners",
    svg: `<svg viewBox="0 0 140 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M 15 15 L 125 15 L 115 38 L 5 38 Z" fill="#D4AF37"/>
      <polygon points="5,38 15,15 0,26" fill="#8A6B0A"/>
      <polygon points="125,15 135,26 115,38" fill="#8A6B0A"/>
    </svg>`,
  },

  // --- Shapes ---
  {
    id: "gold-star",
    title: "5-Point Gold Star",
    category: "shapes",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 62,38 92,38 67,56 77,85 50,67 23,85 33,56 8,38 38,38" fill="#FFD700" stroke="#FFF5C0" stroke-width="2"/>
    </svg>`,
  },
  {
    id: "heart-red",
    title: "Glossy Red Heart",
    category: "shapes",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 85 C 10 55 10 20 32 20 C 44 20 50 30 50 30 C 50 30 56 20 68 20 C 90 20 90 55 50 85 Z" fill="#FF3864"/>
      <ellipse cx="36" cy="30" rx="8" ry="5" fill="#FFFFFF" opacity="0.5" transform="rotate(-30 36 30)"/>
    </svg>`,
  },
  {
    id: "gold-ring-frame",
    title: "Gold Glowing Ring Frame",
    category: "shapes",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" stroke-width="4"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#FFF5C0" stroke-width="1.5" stroke-dasharray="4 4"/>
    </svg>`,
  },
];

function ElementsPanel({ onAddElement }) {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = CELEBRATION_ELEMENTS.filter((el) => {
    if (activeCat !== "all" && el.category !== activeCat) return false;
    if (search.trim() && !el.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClick = (element) => {
    if (typeof onAddElement === "function") {
      onAddElement(element);
    }
  };

  return (
    <div className="elements-panel">
      {/* Search Input */}
      <div className="elements-panel__search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search balloons, crowns, cakes, stars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="elements-panel__cats">
        {ELEMENT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              className={activeCat === cat.id ? "active" : ""}
              onClick={() => setActiveCat(cat.id)}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Elements Grid */}
      <div className="elements-panel__grid">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            className="elements-panel__item"
            onClick={() => handleClick(item)}
            title={`Add ${item.title} to canvas`}
          >
            <div
              className="elements-panel__item-preview"
              dangerouslySetInnerHTML={{ __html: item.svg }}
            />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ElementsPanel;
