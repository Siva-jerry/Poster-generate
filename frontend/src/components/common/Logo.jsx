import { Sparkles } from "lucide-react";

import "./Logo.css";

function Logo({
  compact = false,
}) {
  return (
    <div className="app-logo">
      <span className="app-logo__icon">
        <Sparkles size={21} />
      </span>

      {!compact && (
        <span className="app-logo__text">
          SmartWish
          <strong>AI</strong>
        </span>
      )}
    </div>
  );
}

export default Logo;