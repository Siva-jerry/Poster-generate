import {
  Download,
  ImagePlus,
  MousePointer2,
  PencilRuler,
  Sparkles,
} from "lucide-react";

import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Add student details",
    description:
      "Enter the name, department, year, roll number and birthday message.",
    icon: PencilRuler,
  },
  {
    number: "02",
    title: "Upload the photo",
    description:
      "Upload a clear student photo and remove its background automatically.",
    icon: ImagePlus,
  },
  {
    number: "03",
    title: "Choose a design",
    description:
      "Explore premium styles or generate new variations using AI.",
    icon: MousePointer2,
  },
  {
    number: "04",
    title: "Edit and download",
    description:
      "Customise every layer and export the final poster in high quality.",
    icon: Download,
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works section">
      <div className="page-container">
        <div className="section-heading">
          <span className="section-kicker">
            <Sparkles size={15} />
            Simple Workflow
          </span>

          <h2 className="section-title">
            From photo to poster in
            {" "}
            <span className="gradient-text">
              four steps
            </span>
          </h2>
        </div>

        <div className="how-it-works__grid">
          {steps.map(
            ({
              number,
              title,
              description,
              icon: Icon,
            }) => (
              <article
                key={number}
                className="workflow-card"
              >
                <span className="workflow-card__number">
                  {number}
                </span>

                <div className="workflow-card__icon">
                  <Icon size={24} />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;