import {
  Sparkles,
  WandSparkles,
} from "lucide-react";

import CreateForm from "../components/create/CreateForm";

import "./CreatePage.css";

function CreatePage() {
  return (
    <main className="create-page page">
      <section className="create-page__hero">
        <span className="create-page__shape create-page__shape--orange" />
        <span className="create-page__shape create-page__shape--purple" />

        <div className="page-container">
          <span className="section-kicker">
            <WandSparkles size={15} />
            Create New Poster
          </span>

          <h1>
            Tell us about the
            {" "}
            <span className="gradient-text">
              birthday star
            </span>
          </h1>

          <p>
            Add student details, upload
            the photo and choose a design
            direction. Everything can be
            edited later.
          </p>

          <div className="create-page__steps">
            <span className="active">
              <i>1</i>
              Details
            </span>

            <span>
              <i>2</i>
              Choose design
            </span>

            <span>
              <i>3</i>
              Edit poster
            </span>

            <span>
              <i>4</i>
              Download
            </span>
          </div>
        </div>
      </section>

      <section className="create-page__form-section">
        <div className="page-container">
          <div className="create-page__form-label">
            <Sparkles size={17} />

            <span>
              Your information is used
              only for creating the
              poster.
            </span>
          </div>

          <CreateForm />
        </div>
      </section>
    </main>
  );
}

export default CreatePage;