import {
  ArrowRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import AppButton from "../common/AppButton";

import "./HomeCTA.css";

function HomeCTA() {
  return (
    <section className="home-cta section">
      <div className="page-container">
        <div className="home-cta__card">
          <span className="home-cta__shape home-cta__shape--one" />
          <span className="home-cta__shape home-cta__shape--two" />
          <span className="home-cta__shape home-cta__shape--three" />

          <div className="home-cta__icon">
            <WandSparkles size={28} />
          </div>

          <span className="home-cta__eyebrow">
            <Sparkles size={15} />
            Start designing today
          </span>

          <h2>
            Turn every birthday into a
            {" "}
            <span>beautiful memory.</span>
          </h2>

          <p>
            Create an editable premium poster with
            your own photo, colours, fonts and style.
          </p>

          <div className="home-cta__actions">
            <AppButton
              to="/create"
              size="large"
              variant="secondary"
              icon={<ArrowRight size={19} />}
            >
              Create Free Poster
            </AppButton>

            <AppButton
              to="/templates"
              size="large"
              variant="ghost"
              className="home-cta__ghost-button"
            >
              Browse Templates
            </AppButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeCTA;