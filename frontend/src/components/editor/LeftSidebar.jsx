import {
  Bot,
  Layers,
  LayoutTemplate,
  Palette,
  Shapes,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";

import "./LeftSidebar.css";

const tools = [
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    id: "elements",
    label: "Elements",
    icon: Shapes,
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
  },
  {
    id: "background",
    label: "Background",
    icon: Palette,
  },
  {
    id: "layers",
    label: "Layers",
    icon: Layers,
  },
  {
    id: "ai",
    label: "AI Studio",
    icon: Sparkles,
  },
];

function LeftSidebar({
  activeTool,
  onToolChange,
}) {
  return (
    <aside className="editor-left-sidebar">
      <div className="editor-left-sidebar__tools">
        {tools.map(
          ({
            id,
            label,
            icon: Icon,
          }) => (
            <button
              key={id}
              type="button"
              className={
                activeTool === id
                  ? "active"
                  : ""
              }
              onClick={() =>
                onToolChange(id)
              }
              title={label}
            >
              <span>
                <Icon size={21} />
              </span>

              <small>{label}</small>
            </button>
          )
        )}
      </div>
    </aside>
  );
}

export default LeftSidebar;