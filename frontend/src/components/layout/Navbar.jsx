import {
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useState,
} from "react";

import Logo from "../common/Logo";
import AppButton from "../common/AppButton";

import "./Navbar.css";

const navigationItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Templates",
    path: "/templates",
  },
  {
    label: "Create",
    path: "/create",
  },
  {
    label: "My Designs",
    path: "/my-designs",
  },
];

function Navbar() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__container">
        <NavLink
          to="/"
          onClick={closeMobileMenu}
          aria-label="SmartWish AI home"
        >
          <Logo />
        </NavLink>

        <nav
          className={[
            "navbar__nav",
            mobileMenuOpen
              ? "navbar__nav--open"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {navigationItems.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={
                  closeMobileMenu
                }
                className={({
                  isActive,
                }) =>
                  [
                    "navbar__link",
                    isActive
                      ? "navbar__link--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          <div className="navbar__mobile-action">
            <AppButton
              to="/create"
              className="full-width"
              icon={
                <ArrowRight
                  size={17}
                />
              }
            >
              Start Creating
            </AppButton>
          </div>
        </nav>

        <div className="navbar__desktop-action">
          <AppButton
            to="/create"
            icon={
              <ArrowRight size={17} />
            }
          >
            Start Creating
          </AppButton>
        </div>

        <button
          type="button"
          className="navbar__menu-button"
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          onClick={() =>
            setMobileMenuOpen(
              (current) => !current
            )
          }
        >
          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;