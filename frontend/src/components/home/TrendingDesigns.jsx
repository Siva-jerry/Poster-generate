import {
  ArrowRight,
  Crown,
  Heart,
  Sparkles,
} from "lucide-react";

import AppButton from "../common/AppButton";

import "./TrendingDesigns.css";

const trendingDesigns = [
  {
    id: 1,
    name: "Golden Spotlight",
    category: "Luxury",
    className: "trending-card--gold",
    fontClass: "trending-card--serif",
  },
  {
    id: 2,
    name: "Neon Celebration",
    category: "Neon",
    className: "trending-card--neon",
    fontClass: "trending-card--modern",
  },
  {
    id: 3,
    name: "Royal Blue Glow",
    category: "Cinematic",
    className: "trending-card--blue",
    fontClass: "trending-card--bold",
  },
  {
    id: 4,
    name: "Floral Dream",
    category: "Elegant",
    className: "trending-card--floral",
    fontClass: "trending-card--script",
  },
];

function TrendingDesigns() {
  return (
    <section className="trending section">
      <div className="page-container">
        <div className="trending__header">
          <div>
            <span className="section-kicker">
              <Sparkles size={15} />
              Trending Designs
            </span>

            <h2 className="section-title">
              Premium styles loved by
              {" "}
              <span className="gradient-text">
                creators
              </span>
            </h2>

            <p className="section-description">
              Start from a trending style and make it
              completely yours using editable layers,
              colours, fonts and AI tools.
            </p>
          </div>

          <AppButton
            to="/templates"
            variant="secondary"
            icon={<ArrowRight size={18} />}
          >
            View All Designs
          </AppButton>
        </div>

        <div className="trending__grid">
          {trendingDesigns.map(
            ({
              id,
              name,
              category,
              className,
              fontClass,
            }) => (
              <article
                key={id}
                className="trending-design"
              >
                <div
                  className={`trending-card ${className} ${fontClass}`}
                >
                  <div className="trending-card__badge">
                    <Crown size={13} />
                    Premium
                  </div>

                  <button
                    type="button"
                    className="trending-card__favorite"
                    aria-label={`Save ${name}`}
                  >
                    <Heart size={17} />
                  </button>

                  <span className="trending-card__tiny">
                    Birthday Celebration
                  </span>

                  <h3>
                    HAPPY
                    <br />
                    BIRTHDAY
                  </h3>

                  <div className="trending-card__person">
                    <span className="trending-card__head" />
                    <span className="trending-card__body" />
                  </div>

                  <div className="trending-card__footer">
                    <strong>STUDENT NAME</strong>
                    <span>
                      Wishing you a wonderful year
                    </span>
                  </div>
                </div>

                <div className="trending-design__details">
                  <div>
                    <h3>{name}</h3>
                    <p>{category}</p>
                  </div>

                  <AppButton
                    to={`/create?template=${id}`}
                    size="small"
                  >
                    Use
                  </AppButton>
                </div>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default TrendingDesigns;