import { Link } from "react-router-dom";

import "./AppButton.css";

function AppButton({
  children,
  to,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "right",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}) {
  const classes = [
    "app-button",
    `app-button--${variant}`,
    `app-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon &&
        iconPosition === "left" && (
          <span className="app-button__icon">
            {icon}
          </span>
        )}

      <span>{children}</span>

      {icon &&
        iconPosition === "right" && (
          <span className="app-button__icon">
            {icon}
          </span>
        )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export default AppButton;