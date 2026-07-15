const decorationSets = [
  {
    id: "gold-particles",
    name: "Gold Particles",
    category: "luxury",
    tags: ["gold", "particles", "sparkle"],
    elements: [
      {
        type: "particles",
        count: 40,
        position: "all",
        opacity: 0.55,
      },
      {
        type: "glow",
        position: "behind-photo",
        size: 520,
        opacity: 0.42,
      },
      {
        type: "line",
        position: "below-name",
        width: 280,
        height: 3,
      },
    ],
  },

  {
    id: "neon-rings",
    name: "Neon Rings",
    category: "neon",
    tags: ["neon", "rings", "glow"],
    elements: [
      {
        type: "ring",
        position: "behind-photo",
        count: 3,
        opacity: 0.58,
      },
      {
        type: "glow",
        position: "center",
        size: 620,
        opacity: 0.5,
      },
      {
        type: "grid",
        position: "bottom",
        opacity: 0.2,
      },
    ],
  },

  {
    id: "floral-corners",
    name: "Floral Corners",
    category: "floral",
    tags: ["flowers", "corners", "elegant"],
    elements: [
      {
        type: "floral",
        position: "top-left",
        scale: 1,
        opacity: 0.8,
      },
      {
        type: "floral",
        position: "bottom-right",
        scale: 1,
        opacity: 0.8,
      },
      {
        type: "soft-glow",
        position: "behind-photo",
        size: 580,
        opacity: 0.3,
      },
    ],
  },

  {
    id: "editorial-lines",
    name: "Editorial Lines",
    category: "magazine",
    tags: ["lines", "magazine", "minimal"],
    elements: [
      {
        type: "line",
        position: "left-edge",
        width: 4,
        height: 860,
      },
      {
        type: "line",
        position: "heading-bottom",
        width: 230,
        height: 4,
      },
      {
        type: "number",
        position: "top-right",
        value: "01",
        opacity: 0.2,
      },
    ],
  },

  {
    id: "geometric-shapes",
    name: "Geometric Shapes",
    category: "modern",
    tags: ["geometric", "modern", "shapes"],
    elements: [
      {
        type: "circle",
        position: "top-right",
        size: 220,
        opacity: 0.24,
      },
      {
        type: "rectangle",
        position: "bottom-left",
        width: 350,
        height: 180,
        opacity: 0.18,
      },
      {
        type: "line-group",
        position: "background",
        opacity: 0.25,
      },
    ],
  },

  {
    id: "celebration-confetti",
    name: "Celebration Confetti",
    category: "birthday",
    tags: ["confetti", "birthday", "colourful"],
    elements: [
      {
        type: "confetti",
        position: "top",
        count: 45,
        opacity: 0.75,
      },
      {
        type: "balloon",
        position: "top-left",
        count: 2,
        opacity: 0.68,
      },
      {
        type: "balloon",
        position: "top-right",
        count: 2,
        opacity: 0.68,
      },
    ],
  },

  {
    id: "spotlight-smoke",
    name: "Spotlight Smoke",
    category: "cinematic",
    tags: ["spotlight", "smoke", "cinematic"],
    elements: [
      {
        type: "spotlight",
        position: "top-center",
        opacity: 0.48,
      },
      {
        type: "smoke",
        position: "bottom",
        opacity: 0.35,
      },
      {
        type: "particles",
        position: "all",
        count: 25,
        opacity: 0.35,
      },
    ],
  },
];

module.exports = decorationSets;