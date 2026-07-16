import {
  Bot,
  Frame,
  Image,
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
    id: "fonts",
    label: "Fonts",
    icon: Sparkles,
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
  },
  {
    id: "photos",
    label: "Photos",
    icon: Image,
  },
  {
    id: "background",
    label: "Background",
    icon: Palette,
  },
  {
    id: "frames",
    label: "Frames",
    icon: Frame,
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: Bot,
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