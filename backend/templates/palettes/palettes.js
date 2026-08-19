const palettes = [
  {
    id: "black-gold",
    name: "Black Gold",
    category: "luxury",
    tags: ["black", "gold", "dark", "premium", "luxury"],
    colors: {
      background: "#080808",
      backgroundSecondary: "#241803",
      primary: "#D4AF37",
      secondary: "#FFF1A8",
      text: "#FFFFFF",
      mutedText: "#DED6C6",
      accent: "#FFCC4D",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#050505", "#2A1C05", "#080808"],
    },
  },

  {
    id: "royal-blue",
    name: "Royal Blue",
    category: "college",
    tags: ["blue", "royal", "college", "clean", "graduate"],
    colors: {
      background: "#03122F",
      backgroundSecondary: "#0B3C91",
      primary: "#2B7FFF",
      secondary: "#9CC7FF",
      text: "#FFFFFF",
      mutedText: "#D5E6FF",
      accent: "#67E8F9",
    },
    gradient: {
      type: "linear",
      angle: 145,
      colors: ["#020B20", "#0A3F92", "#04142F"],
    },
  },

  {
    id: "purple-neon",
    name: "Purple Neon",
    category: "neon",
    tags: ["purple", "pink", "neon", "modern", "glow"],
    colors: {
      background: "#12051F",
      backgroundSecondary: "#44106D",
      primary: "#B845FF",
      secondary: "#FF4FCB",
      text: "#FFFFFF",
      mutedText: "#E9D5FF",
      accent: "#4DEBFF",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#10031D", "#4E116F", "#160622"],
    },
  },

  {
    id: "rose-pink",
    name: "Rose Pink",
    category: "floral",
    tags: ["pink", "rose", "soft", "elegant", "floral"],
    colors: {
      background: "#FFF3F7",
      backgroundSecondary: "#FFD7E5",
      primary: "#D94A7A",
      secondary: "#F599B7",
      text: "#3A1021",
      mutedText: "#7D5261",
      accent: "#FF6A9E",
    },
    gradient: {
      type: "linear",
      angle: 145,
      colors: ["#FFF7FA", "#FFD8E6", "#FFEFF5"],
    },
  },

  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    category: "luxury",
    tags: ["green", "emerald", "gold", "premium", "luxury"],
    colors: {
      background: "#031A15",
      backgroundSecondary: "#07533E",
      primary: "#D5B85A",
      secondary: "#85E0BD",
      text: "#FFFFFF",
      mutedText: "#C9E8DD",
      accent: "#F5D87A",
    },
    gradient: {
      type: "linear",
      angle: 140,
      colors: ["#02140F", "#076147", "#031A15"],
    },
  },

  {
    id: "sunset-orange",
    name: "Sunset Orange",
    category: "creative",
    tags: ["orange", "red", "bright", "energetic", "creative"],
    colors: {
      background: "#30100B",
      backgroundSecondary: "#B32C16",
      primary: "#FF6A28",
      secondary: "#FFD08A",
      text: "#FFFFFF",
      mutedText: "#FFE0D2",
      accent: "#FFD447",
    },
    gradient: {
      type: "linear",
      angle: 140,
      colors: ["#2B0B08", "#BA301B", "#F26922"],
    },
  },

  {
    id: "minimal-cream",
    name: "Minimal Cream",
    category: "magazine",
    tags: ["cream", "light", "minimal", "editorial", "magazine"],
    colors: {
      background: "#F8F3E8",
      backgroundSecondary: "#E9DFCB",
      primary: "#1B1B1B",
      secondary: "#A86642",
      text: "#171717",
      mutedText: "#675F55",
      accent: "#B77A56",
    },
    gradient: {
      type: "linear",
      angle: 145,
      colors: ["#FFFDF8", "#EFE6D5", "#F8F3E8"],
    },
  },

  {
    id: "cyan-future",
    name: "Cyan Future",
    category: "futuristic",
    tags: ["cyan", "blue", "future", "technology", "cyber"],
    colors: {
      background: "#02151B",
      backgroundSecondary: "#043F4C",
      primary: "#00E5FF",
      secondary: "#7DF9FF",
      text: "#FFFFFF",
      mutedText: "#C7F7FB",
      accent: "#30FFB1",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#011016", "#064E5D", "#02151B"],
    },
  },

  {
    id: "crimson-velvet",
    name: "Crimson Velvet",
    category: "cinematic",
    tags: ["red", "crimson", "cinema", "bold", "dramatic"],
    colors: {
      background: "#180205",
      backgroundSecondary: "#520914",
      primary: "#FF2A4D",
      secondary: "#FFA3B1",
      text: "#FFFFFF",
      mutedText: "#FCD2D8",
      accent: "#FFD700",
    },
    gradient: {
      type: "linear",
      angle: 140,
      colors: ["#140103", "#570A15", "#180205"],
    },
  },

  {
    id: "cyberpunk-violet",
    name: "Cyberpunk Violet",
    category: "neon",
    tags: ["cyberpunk", "violet", "neon", "electric", "matrix"],
    colors: {
      background: "#0D0221",
      backgroundSecondary: "#261447",
      primary: "#FF3864",
      secondary: "#2DE2E6",
      text: "#FFFFFF",
      mutedText: "#C4B5FD",
      accent: "#F706CF",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#0D0221", "#331657", "#05010E"],
    },
  },

  {
    id: "athletic-navy-gold",
    name: "Athletic Navy & Gold",
    category: "sports",
    tags: ["sports", "navy", "gold", "champion", "energy"],
    colors: {
      background: "#0A1128",
      backgroundSecondary: "#1C3166",
      primary: "#FFC72C",
      secondary: "#FFFFFF",
      text: "#FFFFFF",
      mutedText: "#CCD7E8",
      accent: "#FF5900",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#070D1F", "#1A2E61", "#09122C"],
    },
  },

  {
    id: "vintage-sepia",
    name: "Vintage Sepia",
    category: "creative",
    tags: ["sepia", "vintage", "retro", "classic", "warm"],
    colors: {
      background: "#281E19",
      backgroundSecondary: "#4E3629",
      primary: "#E0B589",
      secondary: "#F4E3D7",
      text: "#FFF9F4",
      mutedText: "#D4BDB0",
      accent: "#D68C45",
    },
    gradient: {
      type: "linear",
      angle: 145,
      colors: ["#211713", "#523B2D", "#281E19"],
    },
  },

  {
    id: "champagne-luxe",
    name: "Champagne Luxe",
    category: "luxury",
    tags: ["champagne", "white", "gold", "deluxe", "glamour"],
    colors: {
      background: "#FAF7F2",
      backgroundSecondary: "#EDE3D4",
      primary: "#B38728",
      secondary: "#C49746",
      text: "#1E1A17",
      mutedText: "#6E6258",
      accent: "#D4AF37",
    },
    gradient: {
      type: "linear",
      angle: 140,
      colors: ["#FFFDF9", "#EDE2D1", "#FAF6EF"],
    },
  },

  {
    id: "midnight-amethyst",
    name: "Midnight Amethyst",
    category: "cinematic",
    tags: ["amethyst", "deep-purple", "mystic", "cinematic", "gem"],
    colors: {
      background: "#090314",
      backgroundSecondary: "#230D42",
      primary: "#D896FF",
      secondary: "#EEDBFF",
      text: "#FFFFFF",
      mutedText: "#DAC9EE",
      accent: "#FFE066",
    },
    gradient: {
      type: "linear",
      angle: 145,
      colors: ["#07020E", "#2B1152", "#0C041A"],
    },
  },

  {
    id: "forest-sage",
    name: "Forest Sage",
    category: "floral",
    tags: ["sage", "forest", "green", "botanical", "calm"],
    colors: {
      background: "#122019",
      backgroundSecondary: "#1E3B2E",
      primary: "#98D8AA",
      secondary: "#E8FFEB",
      text: "#FFFFFF",
      mutedText: "#BDD8C8",
      accent: "#F7D070",
    },
    gradient: {
      type: "linear",
      angle: 140,
      colors: ["#0D1913", "#234435", "#11211A"],
    },
  },

  {
    id: "tokyo-night",
    name: "Tokyo Night",
    category: "futuristic",
    tags: ["tokyo", "japan", "neon", "city", "future"],
    colors: {
      background: "#080B1A",
      backgroundSecondary: "#141C3D",
      primary: "#38EF7D",
      secondary: "#11998E",
      text: "#FFFFFF",
      mutedText: "#C0D6D4",
      accent: "#00F2FE",
    },
    gradient: {
      type: "linear",
      angle: 135,
      colors: ["#060815", "#162045", "#090D22"],
    },
  },
];

module.exports = palettes;