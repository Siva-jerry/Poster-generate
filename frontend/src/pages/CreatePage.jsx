import { useEffect, useMemo, useState } from "react";
import CreateForm from "../components/create/CreateForm";
import "./CreatePage.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];

  const unitIndex = Math.min(
    Math.floor(
      Math.log(size) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const value =
    size /
    1024 ** unitIndex;

  return `${value.toFixed(
    unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`;
}

function sanitizeDownloadName(
  value,
  fallback = "birthday-poster"
) {
  const safeValue = String(
    value || fallback
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeValue || fallback;
}

/*
|--------------------------------------------------------------------------
| Create Page
|--------------------------------------------------------------------------
*/

function CreatePage() {
  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationResult, setGenerationResult] =
    useState(null);

  const [selectedPoster, setSelectedPoster] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [downloadState, setDownloadState] =
    useState({
      posterId: null,
      downloading: false,
    });

  /*
  |--------------------------------------------------------------------------
  | Generated poster list
  |--------------------------------------------------------------------------
  */

  const posters = useMemo(() => {
    if (
      !Array.isArray(
        generationResult?.posters
      )
    ) {
      return [];
    }

    return generationResult.posters;
  }, [generationResult]);

  /*
  |--------------------------------------------------------------------------
  | Select first poster after generation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (posters.length > 0) {
      setSelectedPoster(posters[0]);
    } else {
      setSelectedPoster(null);
    }
  }, [posters]);

  /*
  |--------------------------------------------------------------------------
  | Generation callbacks
  |--------------------------------------------------------------------------
  */

  function handleGenerateStart() {
    setIsGenerating(true);
    setErrorMessage("");
    setGenerationResult(null);
    setSelectedPoster(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleGenerateSuccess(result) {
    setIsGenerating(false);
    setGenerationResult(result);
    setErrorMessage("");

    window.setTimeout(() => {
      const resultSection =
        document.getElementById(
          "generated-posters"
        );

      resultSection?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function handleGenerateError(
    message
  ) {
    setIsGenerating(false);

    setErrorMessage(
      message ||
        "Poster generation failed. Please try again."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Poster download
  |--------------------------------------------------------------------------
  */

  async function downloadPoster(
    poster
  ) {
    if (!poster?.url) {
      setErrorMessage(
        "Poster download URL is unavailable."
      );

      return;
    }

    setDownloadState({
      posterId:
        poster.id ||
        poster.filename ||
        poster.url,

      downloading: true,
    });

    try {
      const response = await fetch(
        poster.url
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download the poster."
        );
      }

      const blob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(blob);

      const extension =
        poster.filename
          ?.split(".")
          .pop() || "png";

      const studentName =
        generationResult?.student
          ?.name ||
        poster.title ||
        "birthday-poster";

      const filename =
        poster.filename ||
        `${sanitizeDownloadName(
          studentName
        )}-birthday-poster.${extension}`;

      const link =
        document.createElement("a");

      link.href = objectUrl;
      link.download = filename;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        objectUrl
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to download the poster."
      );
    } finally {
      setDownloadState({
        posterId: null,
        downloading: false,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Open poster in new tab
  |--------------------------------------------------------------------------
  */

  function openPoster(poster) {
    if (!poster?.url) {
      return;
    }

    window.open(
      poster.url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Clear result
  |--------------------------------------------------------------------------
  */

  function clearGenerationResult() {
    setGenerationResult(null);
    setSelectedPoster(null);
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="create-page">
      <div className="create-page__background">
        <span className="create-page__glow create-page__glow--one" />
        <span className="create-page__glow create-page__glow--two" />
        <span className="create-page__grid" />
      </div>

      <div className="create-page__container">
        <section className="create-page__intro">
          <div className="create-page__intro-content">
            <span className="create-page__badge">
              AI Birthday Poster Studio
            </span>

            <h1>
              Turn a student photo into a
              premium birthday poster.
            </h1>

            <p>
              Enter the student details,
              choose a visual style and
              let SmartWish AI generate
              multiple professionally
              composed birthday designs.
            </p>

            <div className="create-page__features">
              <span>
                ✦ AI-generated
                backgrounds
              </span>

              <span>
                ✦ Automatic portrait
                composition
              </span>

              <span>
                ✦ Multiple premium
                variations
              </span>
            </div>
          </div>

          <div className="create-page__intro-card">
            <div className="create-page__intro-card-icon">
              ✦
            </div>

            <strong>
              SmartWish AI
            </strong>

            <p>
              Premium posters designed
              for college birthday
              celebrations.
            </p>

            <div className="create-page__intro-card-list">
              <span>
                1080 × 1350 output
              </span>

              <span>
                Ready to download
              </span>

              <span>
                Custom text and theme
              </span>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div
            className="create-page__global-error"
            role="alert"
          >
            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              aria-label="Close error"
              onClick={() =>
                setErrorMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        <section className="create-page__form-section">
          <CreateForm
            onGenerateStart={
              handleGenerateStart
            }
            onGenerateSuccess={
              handleGenerateSuccess
            }
            onGenerateError={
              handleGenerateError
            }
          />
        </section>

        {isGenerating && (
          <section className="create-page__loading-section">
            <div className="create-page__loading-card">
              <div className="create-page__ai-loader">
                <span />
                <span />
                <span />
              </div>

              <div>
                <span className="create-page__loading-label">
                  SmartWish AI
                </span>

                <h2>
                  Creating your birthday
                  posters
                </h2>

                <p>
                  Generating AI
                  backgrounds, preparing
                  the student portrait
                  and composing premium
                  poster variations.
                </p>
              </div>
            </div>

            <div className="create-page__progress-steps">
              <div className="is-active">
                <span>1</span>
                <p>
                  Reading your design
                  request
                </p>
              </div>

              <div className="is-active">
                <span>2</span>
                <p>
                  Creating AI background
                  variations
                </p>
              </div>

              <div>
                <span>3</span>
                <p>
                  Composing portrait and
                  typography
                </p>
              </div>

              <div>
                <span>4</span>
                <p>
                  Preparing final poster
                  files
                </p>
              </div>
            </div>
          </section>
        )}

        {generationResult &&
          posters.length > 0 && (
            <section
              id="generated-posters"
              className="create-page__results"
            >
              <div className="create-page__results-header">
                <div>
                  <span className="create-page__results-badge">
                    Generation complete
                  </span>

                  <h2>
                    Your premium birthday
                    posters are ready
                  </h2>

                  <p>
                    {generationResult.generatedVariationCount ||
                      posters.length}{" "}
                    poster variation
                    {posters.length === 1
                      ? ""
                      : "s"}{" "}
                    generated successfully.
                  </p>
                </div>

                <button
                  type="button"
                  className="create-page__new-design-button"
                  onClick={
                    clearGenerationResult
                  }
                >
                  Create another poster
                </button>
              </div>

              <div className="create-page__result-summary">
                <div>
                  <span>
                    Generated
                  </span>

                  <strong>
                    {generationResult.generatedVariationCount ||
                      posters.length}
                  </strong>
                </div>

                <div>
                  <span>Style</span>

                  <strong>
                    {generationResult.style ||
                      "Custom"}
                  </strong>
                </div>

                <div>
                  <span>Poster size</span>

                  <strong>
                    {generationResult
                      .posterSize
                      ?.width ||
                      selectedPoster
                        ?.width ||
                      1080}
                    {" × "}
                    {generationResult
                      .posterSize
                      ?.height ||
                      selectedPoster
                        ?.height ||
                      1350}
                  </strong>
                </div>

                <div>
                  <span>Failed</span>

                  <strong>
                    {generationResult.failedVariationCount ||
                      0}
                  </strong>
                </div>
              </div>

              <div className="create-page__result-layout">
                <div className="create-page__main-preview">
                  {selectedPoster ? (
                    <>
                      <div className="create-page__main-image-wrap">
                        <img
                          src={
                            selectedPoster.previewUrl ||
                            selectedPoster.url
                          }
                          alt={
                            selectedPoster.title ||
                            "Generated birthday poster"
                          }
                        />

                        <span className="create-page__variation-label">
                          Variation{" "}
                          {selectedPoster.variationNumber ||
                            1}
                        </span>
                      </div>

                      <div className="create-page__main-preview-info">
                        <div>
                          <h3>
                            {selectedPoster.title ||
                              "Birthday Poster"}
                          </h3>

                          <p>
                            {selectedPoster.width}
                            {" × "}
                            {selectedPoster.height}

                            {selectedPoster.sizeBytes
                              ? ` • ${formatFileSize(
                                  selectedPoster.sizeBytes
                                )}`
                              : ""}
                          </p>
                        </div>

                        <div className="create-page__main-actions">
                          <button
                            type="button"
                            className="create-page__preview-button"
                            onClick={() =>
                              openPoster(
                                selectedPoster
                              )
                            }
                          >
                            Open full size
                          </button>

                          <button
                            type="button"
                            className="create-page__download-button"
                            disabled={
                              downloadState.downloading &&
                              downloadState.posterId ===
                                (selectedPoster.id ||
                                  selectedPoster.filename ||
                                  selectedPoster.url)
                            }
                            onClick={() =>
                              downloadPoster(
                                selectedPoster
                              )
                            }
                          >
                            {downloadState.downloading &&
                            downloadState.posterId ===
                              (selectedPoster.id ||
                                selectedPoster.filename ||
                                selectedPoster.url)
                              ? "Downloading..."
                              : "Download poster"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="create-page__empty-preview">
                      Select a poster
                      variation.
                    </div>
                  )}
                </div>

                <aside className="create-page__variation-panel">
                  <div className="create-page__variation-panel-header">
                    <div>
                      <span>
                        Generated designs
                      </span>

                      <h3>
                        Choose a variation
                      </h3>
                    </div>

                    <span className="create-page__poster-count">
                      {posters.length}
                    </span>
                  </div>

                  <div className="create-page__variation-list">
                    {posters.map(
                      (
                        poster,
                        index
                      ) => {
                        const posterKey =
                          poster.id ||
                          poster.filename ||
                          poster.url ||
                          index;

                        const isSelected =
                          selectedPoster ===
                            poster ||
                          selectedPoster
                            ?.id ===
                            poster.id;

                        return (
                          <article
                            key={
                              posterKey
                            }
                            className={`create-page__variation-card ${
                              isSelected
                                ? "is-selected"
                                : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="create-page__variation-select"
                              onClick={() =>
                                setSelectedPoster(
                                  poster
                                )
                              }
                            >
                              <div className="create-page__variation-thumbnail">
                                <img
                                  src={
                                    poster.previewUrl ||
                                    poster.url
                                  }
                                  alt={
                                    poster.title ||
                                    `Poster variation ${
                                      index +
                                      1
                                    }`
                                  }
                                />
                              </div>

                              <div className="create-page__variation-info">
                                <strong>
                                  Variation{" "}
                                  {poster.variationNumber ||
                                    index +
                                      1}
                                </strong>

                                <span>
                                  {poster.style ||
                                    generationResult.style ||
                                    "Custom"}
                                </span>

                                {poster.sizeBytes && (
                                  <small>
                                    {formatFileSize(
                                      poster.sizeBytes
                                    )}
                                  </small>
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              className="create-page__variation-download"
                              aria-label={`Download variation ${
                                poster.variationNumber ||
                                index + 1
                              }`}
                              disabled={
                                downloadState.downloading &&
                                downloadState.posterId ===
                                  (poster.id ||
                                    poster.filename ||
                                    poster.url)
                              }
                              onClick={() =>
                                downloadPoster(
                                  poster
                                )
                              }
                            >
                              {downloadState.downloading &&
                              downloadState.posterId ===
                                (poster.id ||
                                  poster.filename ||
                                  poster.url)
                                ? "..."
                                : "↓"}
                            </button>
                          </article>
                        );
                      }
                    )}
                  </div>
                </aside>
              </div>

              {Array.isArray(
                generationResult.failures
              ) &&
                generationResult.failures
                  .length > 0 && (
                  <div className="create-page__failure-notice">
                    <strong>
                      Some variations
                      could not be
                      generated.
                    </strong>

                    <p>
                      {
                        generationResult
                          .failures.length
                      }{" "}
                      variation
                      {generationResult
                        .failures
                        .length === 1
                        ? ""
                        : "s"}{" "}
                      failed, but the
                      successful posters
                      are available above.
                    </p>
                  </div>
                )}
            </section>
          )}

        {generationResult &&
          posters.length === 0 && (
            <section className="create-page__no-results">
              <span>!</span>

              <h2>
                No posters were generated
              </h2>

              <p>
                The request completed,
                but no successful poster
                files were returned.
                Please try a different
                prompt.
              </p>

              <button
                type="button"
                onClick={
                  clearGenerationResult
                }
              >
                Try again
              </button>
            </section>
          )}
      </div>
    </main>
  );
}

export default CreatePage;