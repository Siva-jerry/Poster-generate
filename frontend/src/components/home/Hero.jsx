import {
  ArrowRight,
  BadgeCheck,
  Image,
  Layers3,
  Palette,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import AppButton from "../common/AppButton";

import "./Hero.css";

const heroHighlights = [
  {
    icon: Palette,
    label: "Premium styles",
  },
  {
    icon: Layers3,
    label: "Fully editable",
  },
  {
    icon: WandSparkles,
    label: "AI powered",
  },
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero__background">
        <span className="hero__blob hero__blob--orange" />
        <span className="hero__blob hero__blob--purple" />
        <span className="hero__blob hero__blob--cyan" />
      </div>

      <div className="hero__container page-container">
        <div className="hero__content">
          <div className="hero__badge animate-reveal">
            <Sparkles size={16} />

            <span>
              AI-powered birthday poster studio
            </span>

            <BadgeCheck size={16} />
          </div>

          <h1 className="hero__title animate-reveal">
            Create posters that look
            {" "}
            <span className="hero__title-gradient">
              professionally designed
            </span>
            {" "}
            in minutes.
          </h1>

          <p className="hero__description animate-reveal">
            Upload a photo, explore premium designs,
            remove the background, generate AI styles
            and edit every element using our
            Canva-style poster studio.
          </p>

          <div className="hero__actions animate-reveal">
            <AppButton
              to="/create"
              size="large"
              variant="gradient"
              icon={<ArrowRight size={19} />}
            >
              Create Your Poster
            </AppButton>

            <AppButton
              to="/templates"
              size="large"
              variant="secondary"
              icon={<Play size={18} />}
              iconPosition="left"
            >
              Explore Designs
            </AppButton>
          </div>

          <div className="hero__highlights animate-reveal">
            {heroHighlights.map(
              ({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="hero__highlight"
                >
                  <span>
                    <Icon size={17} />
                  </span>

                  <p>{label}</p>
                </div>
              )
            )}
          </div>

          <div className="hero__stats animate-reveal">
            <div>
              <strong>2,000+</strong>
              <span>Design combinations</span>
            </div>

            <div>
              <strong>20+</strong>
              <span>Creative categories</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Editable posters</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-glow" />

          <article className="hero-poster hero-poster--main">
            <div className="hero-poster__decoration">
              <span />
              <span />
              <span />
            </div>

            <div className="hero-poster__label">
              Birthday Celebration
            </div>

            <h2>
              HAPPY
              <br />
              BIRTHDAY
            </h2>

            <div className="hero-poster__portrait">
              <div className="hero-poster__head" />
              <div className="hero-poster__body" />
            </div>

            <div className="hero-poster__name">
              <span>Celebrate</span>
              <strong>SIVA M</strong>
              <small>
                Wishing you happiness and success
              </small>
            </div>
          </article>

          <article className="hero-mini-card hero-mini-card--left">
            <div className="hero-mini-card__icon">
              <Image size={20} />
            </div>

            <div>
              <strong>AI Background</strong>
              <span>Generated instantly</span>
            </div>
          </article>

          <article className="hero-mini-card hero-mini-card--right">
            <div className="hero-mini-card__icon hero-mini-card__icon--purple">
              <Layers3 size={20} />
            </div>

            <div>
              <strong>Editable Layers</strong>
              <span>Move, resize and style</span>
            </div>
          </article>

          <div className="hero-floating-shape hero-floating-shape--one">
            <Sparkles size={22} />
          </div>

          <div className="hero-floating-shape hero-floating-shape--two">
            <Palette size={22} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;