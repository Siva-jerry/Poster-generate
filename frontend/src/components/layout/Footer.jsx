import {
  Heart,
  Sparkles,
} from "lucide-react";

import Logo from "../common/Logo";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <Logo />

          <p>
            Premium birthday posters,
            made faster with AI and
            editable design tools.
          </p>
        </div>

        <div className="footer__note">
          <Sparkles size={16} />

          <span>
            Designed with
          </span>

          <Heart
            size={16}
            fill="currentColor"
          />

          <span>
            using SmartWish AI
          </span>
        </div>

        <p className="footer__copyright">
          © {new Date().getFullYear()}
          {" "}SmartWish AI
        </p>
      </div>
    </footer>
  );
}

export default Footer;