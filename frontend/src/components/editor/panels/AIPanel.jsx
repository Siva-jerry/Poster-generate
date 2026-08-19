import React, { useState } from "react";
import { Sparkles, Wand2, ArrowRight, CheckCircle2 } from "lucide-react";
import "./AIPanel.css";

const PRESET_PROMPTS = [
  { label: "👑 Royal VIP Gold", prompt: "Royal black and gold luxury celebration poster with 3D metallic balloons, royal crown, gold glitter dust, and extruded gold typography" },
  { label: "🎓 College Flex Hero", prompt: "Mass hero college birthday poster with red & orange smoke explosion, stadium spotlights, and bold collegiate varsity typography" },
  { label: "⚡ Cyberpunk Neon", prompt: "Electric cyan and magenta neon DJ night poster with glowing laser grid floor and futuristic typography" },
  { label: "📸 Aesthetic Polaroid", prompt: "Pastel peach and rose aesthetic birthday poster with taped polaroid photo frame and botanical eucalyptus leaves" },
  { label: "🏆 Sports Champion", prompt: "Dynamic athletic champion birthday flex with speed streaks, gold trophy, and stadium floodlights" },
];

function AIPanel({ onGenerateAI }) {
  const [prompt, setPrompt] = useState("");
  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setSuccessMessage("");

    setTimeout(() => {
      setGenerating(false);
      setSuccessMessage("AI design concept generated successfully!");
      if (typeof onGenerateAI === "function") {
        onGenerateAI({ prompt, studentName, department });
      }
    }, 1200);
  };

  return (
    <div className="ai-panel">
      {/* Header Card */}
      <div className="ai-panel__hero">
        <div className="ai-panel__badge">
          <Sparkles size={14} />
          <span>AI MAGIC STUDIO</span>
        </div>
        <h3>Generate Custom Poster</h3>
        <p>Describe your vision or pick a preset style to generate instant editable layers.</p>
      </div>

      {/* Student Details */}
      <div className="ai-panel__fields">
        <div className="ai-panel__field">
          <label>Student Name</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
        <div className="ai-panel__field">
          <label>Department & Year</label>
          <input
            type="text"
            placeholder="e.g. Dept of CSE - Final Year"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
      </div>

      {/* Prompt Input */}
      <div className="ai-panel__prompt-box">
        <label>Your Design Prompt</label>
        <textarea
          rows="4"
          placeholder="Describe your design theme (colors, lighting, balloons, atmosphere)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Style Chips */}
      <div className="ai-panel__presets">
        <span>Quick Styles:</span>
        <div className="ai-panel__preset-chips">
          {PRESET_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPrompt(item.prompt)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className="ai-panel__generate-btn"
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
      >
        <Wand2 size={17} />
        <span>{generating ? "Crafting AI Layers..." : "Generate AI Poster"}</span>
      </button>

      {successMessage && (
        <div className="ai-panel__success">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default AIPanel;
