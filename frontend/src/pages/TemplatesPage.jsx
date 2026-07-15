import {
  Image,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import TemplateGallery from "../components/gallery/TemplateGallery";

import "./TemplatesPage.css";

function TemplatesPage() {
  return (
    <main className="templates-page page">
      <section className="templates-page__hero">
        <span className="templates-page__shape templates-page__shape--orange" />
        <span className="templates-page__shape templates-page__shape--purple" />

        <div className="page-container">
          <span className="section-kicker">
            <WandSparkles size={15} />
            Premium Templates
          </span>

          <h1>
            Find a design you love,
            then make it
            {" "}
            <span className="gradient-text">
              completely yours
            </span>
          </h1>

          <p>
            Explore editable layouts,
            premium typography, colourful
            palettes and AI-ready poster
            styles.
          </p>

          <div className="templates-page__features">
            <span>
              <Sparkles size={15} />
              Thousands of combinations
            </span>

            <span>
              <Image size={15} />
              Premium visual previews
            </span>

            <span>
              <WandSparkles size={15} />
              Fully editable
            </span>
          </div>
        </div>
      </section>

      <section className="templates-page__gallery">
        <div className="page-container">
          <TemplateGallery />
        </div>
      </section>
    </main>
  );
}

export default TemplatesPage;