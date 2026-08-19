import { useEffect, useMemo, useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  Crown,
  Zap,
  Camera,
  Trophy,
  Palette,
  Flower2,
  Clapperboard,
  Landmark,
  Flame,
  CheckCircle2,
  RefreshCw,
  Wand2,
  User,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Shuffle,
  Eye,
  SlidersHorizontal,
  Check,
  Award,
  Scissors,
  Image as ImageIcon,
} from "lucide-react";
import { generatePoster } from "../../services/posterService";
import "./CreateForm.css";

const PRESET_STYLES = [
  {
    value: "mix",
    label: "🎲 Mix & Match Archetypes",
    icon: Shuffle,
    tag: "4 Unique Layouts",
    gradient: "linear-gradient(135deg, #0f0c1b, #3b1d60, #d4af37, #00f0ff)",
    description: "Generates 4 completely distinct layouts: Royal Center Stage, Hero Split, Polaroid, and Varsity Laurel.",
  },
  {
    value: "luxury",
    label: "👑 Royal VIP Stage",
    icon: Crown,
    tag: "Center Stage",
    gradient: "linear-gradient(135deg, #111111, #3A2405, #D4AF37)",
    description: "Grand center stage spotlights, 3D metallic balloons, royal crown and extruded gold typography.",
  },
  {
    value: "modern",
    label: "⚡ Mass Hero Movie Flex",
    icon: Zap,
    tag: "Dynamic Split",
    gradient: "linear-gradient(135deg, #090217, #24084F, #00F0FF)",
    description: "Asymmetric left-aligned varsity title, dynamic right photo cutout, laser speedlines and stadium lights.",
  },
  {
    value: "floral",
    label: "📸 Aesthetic Polaroid",
    icon: Camera,
    tag: "Instagram Trend",
    gradient: "linear-gradient(135deg, #1A0713, #45152F, #FF7597)",
    description: "Tilted polaroid cutout frame with washi tape, cursive script lettering, and delicate champagne sparkles.",
  },
  {
    value: "sports",
    label: "🏆 Varsity Champion",
    icon: Trophy,
    tag: "Athletic Laurel",
    gradient: "linear-gradient(135deg, #040F2D, #0B256B, #38EF7D)",
    description: "Top varsity header banner, diamond achievement shield, laurel wreath and carbon-fibre badge.",
  },
  {
    value: "neon",
    label: "🔮 Cyberpunk Neon",
    icon: Palette,
    tag: "DJ Night",
    gradient: "linear-gradient(135deg, #0D0221, #4A0E4E, #FF3864)",
    description: "Glowing neon rings, cyan & magenta laser reflections, cyber grid floor and futuristic badges.",
  },
  {
    value: "cinematic",
    label: "🎬 Hollywood Blockbuster",
    icon: Clapperboard,
    tag: "Action Hero",
    gradient: "linear-gradient(135deg, #180808, #451010, #F97316)",
    description: "Deep charcoal embers, anamorphic gold lens flares, explosive particles and theatrical billing credits.",
  },
  {
    value: "minimal",
    label: "🏛️ Minimalist Swiss",
    icon: Landmark,
    tag: "High Fashion",
    gradient: "linear-gradient(135deg, #18181B, #27272A, #E4E4E7)",
    description: "Vogue-inspired clean editorial grid, architectural border rules, and crisp high-contrast typography.",
  },
  {
    value: "traditional",
    label: "🪔 Traditional Palace",
    icon: Flame,
    tag: "Heritage Grandeur",
    gradient: "linear-gradient(135deg, #240A04, #5A1E06, #F59E0B)",
    description: "Saffron & marigold garlands, heritage palace arch filigree, and warm brass diya festive glow.",
  },
];

const COLOR_PALETTES = [
  { id: "gold", name: "Royal Gold", primary: "#D4AF37", secondary: "#111111", accent: "#FFF7D6" },
  { id: "cyber", name: "Cyber Neon", primary: "#00F0FF", secondary: "#FF007F", accent: "#CFFAFE" },
  { id: "sapphire", name: "Imperial Blue", primary: "#F59E0B", secondary: "#1E40AF", accent: "#DBEAFE" },
  { id: "crimson", name: "Red Ember", primary: "#EF4444", secondary: "#18181B", accent: "#FCA5A5" },
  { id: "rose", name: "Rose Gold", primary: "#FB7185", secondary: "#4C0519", accent: "#FFE4E6" },
  { id: "emerald", name: "Emerald Prestige", primary: "#10B981", secondary: "#064E3B", accent: "#D1FAE5" },
  { id: "sunset", name: "Sunset Tangerine", primary: "#F97316", secondary: "#6B21A8", accent: "#FED7AA" },
  { id: "monochrome", name: "Platinum Slate", primary: "#E4E4E7", secondary: "#18181B", accent: "#FAFAFA" },
];

const PRESET_STUDENTS = [
  {
    label: "🎓 Student Birthday (Peter Parker)",
    data: {
      name: "PETER PARKER",
      department: "Dept. of Computer Science & Engineering",
      year: "Final Year",
      rollNo: "21CS108",
      collegeName: "COLLEGE OF ENGINEERING & TECHNOLOGY",
      birthdayQuote: "Wishing you a spectacular birthday filled with happiness, triumph and great memories!",
      birthdayHeading: "HAPPY BIRTHDAY",
    },
  },
  {
    label: "🏆 Department Topper / Star",
    data: {
      name: "SARAH CONNOR",
      department: "Dept. of Artificial Intelligence & Data Science",
      year: "3rd Year",
      rollNo: "22AI045",
      collegeName: "INSTITUTE OF TECHNOLOGY & SCIENCE",
      birthdayQuote: "Wishing our academic star continuous success, innovation and brilliant achievements!",
      birthdayHeading: "HAPPY BIRTHDAY CHAMPION",
    },
  },
  {
    label: "⚽ Sports Captain",
    data: {
      name: "ALEX RIDER",
      department: "Dept. of Mechanical Engineering",
      year: "Final Year",
      rollNo: "21ME072",
      collegeName: "NATIONAL COLLEGE OF TECHNOLOGY",
      birthdayQuote: "Keep scoring goals and leading from the front. Wishing our captain a rocking birthday!",
      birthdayHeading: "HAPPY BIRTHDAY CAPTAIN",
    },
  },
  {
    label: "🎨 Cultural Secretary / Artist",
    data: {
      name: "MAYA LIN",
      department: "School of Architecture & Design",
      year: "2nd Year",
      rollNo: "23AR019",
      collegeName: "ACADEMY OF FINE ARTS & DESIGN",
      birthdayQuote: "May your journey be as vibrant and inspiring as your creative art. Have a fabulous birthday!",
      birthdayHeading: "HAPPY BIRTHDAY STAR",
    },
  },
  {
    label: "🏛️ Faculty Special / Mentor",
    data: {
      name: "DR. ALAN GRANT",
      department: "Department of Aerospace Engineering",
      year: "Professor & Head",
      rollNo: "FAC-882",
      collegeName: "GLOBAL INSTITUTE OF TECHNOLOGY",
      birthdayQuote: "Thank you for inspiring minds and guiding future leaders. Wishing you health and prosperity!",
      birthdayHeading: "HAPPY BIRTHDAY SIR",
    },
  },
];

const PROMPT_SUGGESTIONS = [
  "3D metallic gold balloons & stage spotlights",
  "Dramatic red smoke explosion & stadium lighting",
  "Golden laurel wreath with academic achievement stars",
  "Polaroid cutout with pastel botanical leaves & bokeh",
  "Cyberpunk neon laser rays with glowing cyan outlines",
  "Anamorphic gold lens flares with floating embers",
];

const INITIAL_FORM = {
  name: "PETER PARKER",
  department: "Dept. of Computer Science & Engineering",
  year: "Final Year",
  rollNo: "21CS108",
  collegeName: "COLLEGE OF ENGINEERING & TECHNOLOGY",
  birthdayQuote: "Wishing you a spectacular birthday filled with happiness, triumph and great memories!",
  birthdayHeading: "HAPPY BIRTHDAY",
  designation: "",
  date: "",
  prompt: "Royal VIP celebration poster with 3D metallic balloons, stage spotlights, and extruded gold typography",
  style: "mix",
  theme: "",
  colors: "Royal Gold",
  variationCount: 4,
  removeBackground: true,
};

function CreateForm({ onGenerateStart, onGenerateSuccess, onGenerateError }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const selectedStyle = useMemo(
    () => PRESET_STYLES.find((item) => item.value === form.style) || PRESET_STYLES[0],
    [form.style]
  );

  const handleApplyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      ...preset.data,
    }));
  };

  const handleSelectColor = (pal) => {
    setSelectedColor(pal);
    setForm((prev) => ({
      ...prev,
      colors: pal.name,
    }));
  };

  const handleAddPromptSuggestion = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      prompt: prev.prompt ? `${prev.prompt}, ${suggestion}` : suggestion,
    }));
  };

  const handlePhotoSelect = (file) => {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleLogoSelect = (file) => {
    if (!file) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter the student name.");
      return;
    }

    setIsGenerating(true);
    setError("");
    onGenerateStart?.();

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });

      if (photo) {
        formData.append("photo", photo);
      }
      if (logo) {
        formData.append("logo", logo);
      }

      const result = await generatePoster(formData);
      setIsGenerating(false);
      onGenerateSuccess?.(result);
    } catch (err) {
      setIsGenerating(false);
      const msg = err.response?.data?.message || err.message || "Failed to generate poster variations.";
      setError(msg);
      onGenerateError?.(msg);
    }
  };

  return (
    <form className="modern-create-form" onSubmit={handleSubmit}>
      {/* 1. Quick Profile Presets */}
      <div className="modern-create-form__presets-bar">
        <div className="modern-create-form__presets-label">
          <Sparkles size={15} className="sparkle-icon" />
          <span>Quick Autofill Profiles:</span>
        </div>
        <div className="modern-create-form__presets-list">
          {PRESET_STUDENTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="modern-create-form__preset-chip"
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Style Archetype Selector */}
      <div className="modern-create-form__section">
        <div className="modern-create-form__section-header">
          <div className="section-number">1</div>
          <div>
            <h3>Choose Visual Design Archetype</h3>
            <p>Select a dedicated archetype or pick Mix & Match to get 4 completely varied layouts.</p>
          </div>
        </div>

        <div className="modern-create-form__styles-grid">
          {PRESET_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = form.style === style.value;
            return (
              <div
                key={style.value}
                className={`modern-style-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, style: style.value }))}
                style={{ "--card-gradient": style.gradient }}
              >
                <div className="modern-style-card__badge">{style.tag}</div>
                <div className="modern-style-card__icon-wrap">
                  <Icon size={22} />
                </div>
                <h4>{style.label}</h4>
                <p>{style.description}</p>
                <div className="modern-style-card__radio">
                  <div className="radio-dot" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Color Palette Swatches */}
      <div className="modern-create-form__section">
        <div className="modern-create-form__section-header">
          <div className="section-number">2</div>
          <div>
            <h3>Color Theme & Aesthetic Lighting</h3>
            <p>Select radiant lighting and metallic foil color accents.</p>
          </div>
        </div>

        <div className="modern-palette-row">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = selectedColor.id === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                className={`modern-palette-chip ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleSelectColor(pal)}
              >
                <span
                  className="palette-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${pal.primary} 0%, ${pal.secondary} 100%)`,
                  }}
                />
                <span className="palette-name">{pal.name}</span>
                {isSelected && <Check size={13} className="palette-check" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Student Photo & College Logo */}
      <div className="modern-create-form__section">
        <div className="modern-create-form__section-header">
          <div className="section-number">3</div>
          <div>
            <h3>Student Portrait & College Crest</h3>
            <p>Upload photo with optional AI background removal and framing.</p>
          </div>
        </div>

        <div className="modern-create-form__upload-grid">
          {/* Student Photo */}
          <div
            className={`modern-uploader ${dragOver ? "drag-over" : ""} ${photoPreview ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handlePhotoSelect(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
            />

            {photoPreview ? (
              <div className="modern-uploader__preview-wrap">
                <div className="modern-uploader__cutout-preview">
                  <img src={photoPreview} alt="Student Portrait" />
                </div>
                <div className="modern-uploader__preview-details">
                  <strong>{photo?.name || "Student Photo"}</strong>
                  <span className="ai-tag">
                    {form.removeBackground ? "✨ AI Cutout Active" : "🖼️ Full Photo Frame"}
                  </span>
                  <small>Click to change photo</small>
                </div>
              </div>
            ) : (
              <div className="modern-uploader__empty">
                <div className="modern-uploader__icon">
                  <Upload size={24} />
                </div>
                <strong>Upload Student Portrait</strong>
                <p>Drag & drop or click to browse (JPG, PNG)</p>
                <span className="modern-uploader__pill">
                  {form.removeBackground ? "AI Auto-Cutout Enabled" : "Original Frame Enabled"}
                </span>
              </div>
            )}
          </div>

          {/* College Logo (Optional) */}
          <div
            className={`modern-uploader modern-uploader--logo ${logoPreview ? "has-file" : ""}`}
            onClick={() => logoInputRef.current?.click()}
          >
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleLogoSelect(e.target.files?.[0])}
            />

            {logoPreview ? (
              <div className="modern-uploader__preview-wrap">
                <img src={logoPreview} alt="College Logo" className="logo-preview-img" />
                <div className="modern-uploader__preview-details">
                  <strong>{logo?.name || "College Crest"}</strong>
                  <small>Click to change logo</small>
                </div>
              </div>
            ) : (
              <div className="modern-uploader__empty">
                <div className="modern-uploader__icon">
                  <GraduationCap size={22} />
                </div>
                <strong>College Crest / Logo</strong>
                <p>Optional campus seal to render on header</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Background Removal Toggle Feature */}
        <div
          className={`modern-toggle-box ${form.removeBackground ? "is-active" : ""}`}
          onClick={() => setForm((prev) => ({ ...prev, removeBackground: !prev.removeBackground }))}
        >
          <div className="modern-toggle-info">
            <div className="modern-toggle-title">
              <Scissors size={18} className="toggle-icon" />
              <strong>AI Automatic Background Removal</strong>
              <span className={`toggle-pill ${form.removeBackground ? "pill--cutout" : "pill--frame"}`}>
                {form.removeBackground ? "✨ Cutout Mode ON" : "🖼️ Full Photo Frame"}
              </span>
            </div>
            <p>
              {form.removeBackground
                ? "Isolates the student cleanly from background and blends directly into 3D AI atmosphere."
                : "Keeps original photo background intact inside a styled luxury gold border frame."}
            </p>
          </div>

          <div className={`modern-switch ${form.removeBackground ? "is-on" : ""}`}>
            <div className="switch-thumb" />
          </div>
        </div>
      </div>

      {/* 5. Student Details & Live Interactive Mockup */}
      <div className="modern-create-form__section">
        <div className="modern-create-form__section-header">
          <div className="section-number">4</div>
          <div>
            <h3>Student Details & Live Design Mockup</h3>
            <p>Personalize typography, department, and view real-time layout preview.</p>
          </div>
        </div>

        <div className="modern-create-form__split-layout">
          {/* Input Fields */}
          <div className="modern-create-form__fields-grid">
            <div className="modern-field">
              <label>
                <User size={15} />
                <span>Student Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PETER PARKER"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="modern-field">
              <label>
                <Sparkles size={15} />
                <span>Birthday Heading</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HAPPY BIRTHDAY"
                value={form.birthdayHeading}
                onChange={(e) => setForm({ ...form, birthdayHeading: e.target.value })}
              />
            </div>

            <div className="modern-field">
              <label>
                <GraduationCap size={15} />
                <span>Department & Year</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dept. of Computer Science • Final Year"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="modern-field">
              <label>
                <Building2 size={15} />
                <span>College Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. COLLEGE OF ENGINEERING & TECHNOLOGY"
                value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
              />
            </div>

            <div className="modern-field modern-field--full">
              <label>
                <Calendar size={15} />
                <span>Roll Number / Register ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 21CS108"
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
              />
            </div>

            <div className="modern-field modern-field--full">
              <label>
                <Sparkles size={15} />
                <span>Birthday Wish Quote</span>
              </label>
              <textarea
                rows="3"
                placeholder="Write an inspiring birthday wish for the student..."
                value={form.birthdayQuote}
                onChange={(e) => setForm({ ...form, birthdayQuote: e.target.value })}
              />
            </div>
          </div>

          {/* Interactive Live Mockup Card */}
          <div className="modern-live-mockup-wrap">
            <div className="modern-live-mockup-header">
              <Eye size={14} />
              <span>Live Archetype Preview</span>
              <span className="live-pill">{selectedStyle.label.split(" ")[1] || "Preview"}</span>
            </div>

            <div
              className={`modern-mockup-card archetype--${form.style}`}
              style={{
                "--preview-primary": selectedColor.primary,
                "--preview-secondary": selectedColor.secondary,
              }}
            >
              {/* College Header */}
              <div className="mockup-college">
                {form.collegeName || "COLLEGE OF TECHNOLOGY"}
              </div>

              {/* Archetype-specific Layout Body */}
              <div className="mockup-body">
                {/* Photo preview container */}
                <div className={`mockup-photo-frame ${!form.removeBackground ? "mockup-photo-frame--unmasked" : ""}`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student" className="mockup-photo-img" />
                  ) : (
                    <div className="mockup-photo-placeholder">
                      <User size={40} />
                    </div>
                  )}
                  {form.style === "sports" && <Award size={22} className="mockup-laurel-badge" />}
                  {form.style === "luxury" && <Crown size={20} className="mockup-crown-badge" />}
                </div>

                {/* Typography Container */}
                <div className="mockup-text-container">
                  <div className="mockup-heading">
                    {form.birthdayHeading || "HAPPY BIRTHDAY"}
                  </div>
                  <div className="mockup-name">{form.name || "STUDENT NAME"}</div>
                  <div className="mockup-divider">
                    <span className="divider-line" />
                    <span className="divider-dot">✦</span>
                    <span className="divider-line" />
                  </div>
                  <div className="mockup-dept">
                    {form.department || "Dept. of Computer Science"}
                  </div>
                  <div className="mockup-quote">
                    "{form.birthdayQuote ? form.birthdayQuote.slice(0, 80) + "..." : "Wishing you a spectacular birthday!"}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AI Magic Studio Prompt */}
      <div className="modern-create-form__section">
        <div className="modern-create-form__section-header">
          <div className="section-number">5</div>
          <div>
            <h3>AI Magic Studio Prompt & Lighting</h3>
            <p>Fine-tune background atmosphere, spotlight rays, and party graphics.</p>
          </div>
        </div>

        <div className="modern-prompt-box">
          <textarea
            rows="3"
            placeholder="Describe your design theme (e.g. 3D metallic balloons, dramatic spotlights, gold laurel crest)..."
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          />

          <div className="modern-prompt-suggestions">
            <span>Click to add elements:</span>
            {PROMPT_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                className="suggestion-chip"
                onClick={() => handleAddPromptSuggestion(sug)}
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="modern-create-form__error-alert">
          <span>{error}</span>
        </div>
      )}

      {/* Action Submit Bar */}
      <div className="modern-create-form__submit-bar">
        {/* Variation Count Selector (1 to 4) */}
        <div className="modern-variation-selector">
          <span className="var-label">
            <Layers size={16} />
            <span>Variation Count:</span>
          </span>
          <div className="var-options">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                className={`var-chip ${form.variationCount === num ? "is-active" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, variationCount: num }))}
              >
                {num} {num === 1 ? "Poster" : "Variations"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="modern-create-form__generate-button"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={20} className="spin-icon" />
              <span>Crafting {form.variationCount} AI Poster Variations...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate {form.variationCount} AI Poster{form.variationCount > 1 ? "s" : ""}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CreateForm;