import { useEffect, useMemo, useState } from "react";
import {
  generatePoster,
  getPosterStatus,
} from "../../services/posterService";

import "./CreateForm.css";

/*
|--------------------------------------------------------------------------
| Initial form values
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {
  name: "",
  department: "",
  year: "",
  rollNo: "",
  collegeName: "",
  birthdayQuote: "",
  birthdayHeading: "HAPPY BIRTHDAY",
  designation: "",
  date: "",
  prompt: "",
  style: "luxury",
  theme: "",
  colors: "",
  variationCount: 4,
  removeBackground: true,
};

/*
|--------------------------------------------------------------------------
| Style options
|--------------------------------------------------------------------------
*/

const STYLE_OPTIONS = [
  {
    value: "luxury",
    label: "Luxury",
    description:
      "Premium gold, elegant lighting and rich decoration.",
  },
  {
    value: "modern",
    label: "Modern",
    description:
      "Clean typography, gradients and contemporary composition.",
  },
  {
    value: "floral",
    label: "Floral",
    description:
      "Beautiful flowers, soft colors and graceful decoration.",
  },
  {
    value: "neon",
    label: "Neon",
    description:
      "Glowing lights, vivid colors and futuristic effects.",
  },
  {
    value: "sports",
    label: "Sports",
    description:
      "Powerful movement, speed effects and energetic composition.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description:
      "Simple, clean and sophisticated birthday design.",
  },
];

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

function CreateForm({
  onGenerateStart,
  onGenerateSuccess,
  onGenerateError,
  onGenerated,
}) {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [photo, setPhoto] =
    useState(null);

  const [logo, setLogo] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [logoPreview, setLogoPreview] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [serviceStatus, setServiceStatus] =
    useState({
      checking: true,
      ready: false,
      message:
        "Checking AI poster service...",
    });

  /*
  |--------------------------------------------------------------------------
  | Selected style information
  |--------------------------------------------------------------------------
  */

  const selectedStyle = useMemo(
    () =>
      STYLE_OPTIONS.find(
        (item) =>
          item.value === form.style
      ) || STYLE_OPTIONS[0],
    [form.style]
  );

  /*
  |--------------------------------------------------------------------------
  | Check backend poster service
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    async function checkService() {
      try {
        const result =
          await getPosterStatus();

        if (!active) {
          return;
        }

        setServiceStatus({
          checking: false,
          ready: Boolean(result.ready),
          message: result.ready
            ? "AI poster service is ready."
            : "AI service configuration is incomplete.",
        });
      } catch (statusError) {
        if (!active) {
          return;
        }

        setServiceStatus({
          checking: false,
          ready: false,
          message:
            statusError.message ||
            "Unable to connect to the backend.",
        });
      }
    }

    checkService();

    return () => {
      active = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Revoke preview URLs
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

      if (logoPreview) {
        URL.revokeObjectURL(
          logoPreview
        );
      }
    };
  }, [photoPreview, logoPreview]);

  /*
  |--------------------------------------------------------------------------
  | Input handlers
  |--------------------------------------------------------------------------
  */

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }
  }

  function validateImage(
    file,
    maximumSizeMb
  ) {
    if (!file) {
      return "";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      return "Use a JPG, PNG, WEBP, GIF or AVIF image.";
    }

    const maximumBytes =
      maximumSizeMb *
      1024 *
      1024;

    if (
      file.size > maximumBytes
    ) {
      return `Image must not exceed ${maximumSizeMb} MB.`;
    }

    return "";
  }

  function handlePhotoChange(event) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const validationError =
      validateImage(
        selectedFile,
        10
      );

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setPhoto(selectedFile);

    setPhotoPreview(
      URL.createObjectURL(
        selectedFile
      )
    );

    setError("");
  }

  function handleLogoChange(event) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const validationError =
      validateImage(
        selectedFile,
        5
      );

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogo(selectedFile);

    setLogoPreview(
      URL.createObjectURL(
        selectedFile
      )
    );

    setError("");
  }

  function removePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    setPhoto(null);
    setPhotoPreview("");
  }

  function removeLogo() {
    if (logoPreview) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogo(null);
    setLogoPreview("");
  }

  /*
  |--------------------------------------------------------------------------
  | Form validation
  |--------------------------------------------------------------------------
  */

  function validateForm() {
    if (!photo) {
      return "Please upload the student's photo.";
    }

    if (!form.name.trim()) {
      return "Please enter the student's name.";
    }

    if (!form.prompt.trim()) {
      return "Please describe the birthday poster design.";
    }

    const count = Number(
      form.variationCount
    );

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 8
    ) {
      return "Variation count must be between 1 and 8.";
    }

    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | Generate posters
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(event) {
    event.preventDefault();

    if (isGenerating) {
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      onGenerateError?.(
        validationError
      );

      return;
    }

    setError("");
    setIsGenerating(true);

    onGenerateStart?.();

    try {
      const result =
        await generatePoster({
          photo,
          logo,

          name:
            form.name.trim(),

          department:
            form.department.trim(),

          year:
            form.year.trim(),

          rollNo:
            form.rollNo.trim(),

          collegeName:
            form.collegeName.trim(),

          birthdayQuote:
            form.birthdayQuote.trim(),

          birthdayHeading:
            form.birthdayHeading.trim() ||
            "HAPPY BIRTHDAY",

          designation:
            form.designation.trim(),

          date:
            form.date,

          prompt:
            form.prompt.trim(),

          style:
            form.style,

          theme:
            form.theme.trim(),

          colors:
            form.colors.trim(),

          variationCount:
            Number(
              form.variationCount
            ),

          removeBackground:
            form.removeBackground,
        });

      onGenerateSuccess?.(result);
      onGenerated?.(result);
    } catch (generateError) {
      const message =
        generateError.message ||
        "Unable to generate posters.";

      setError(message);

      onGenerateError?.(
        message,
        generateError
      );
    } finally {
      setIsGenerating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Reset form
  |--------------------------------------------------------------------------
  */

  function handleReset() {
    if (isGenerating) {
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview
      );
    }

    if (logoPreview) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setForm(INITIAL_FORM);
    setPhoto(null);
    setLogo(null);
    setPhotoPreview("");
    setLogoPreview("");
    setError("");
  }

  return (
    <form
      className="create-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="create-form__header">
        <div>
          <span className="create-form__eyebrow">
            SmartWish AI
          </span>

          <h1>
            Create a Birthday Poster
          </h1>

          <p>
            Upload the student photo,
            enter the birthday details
            and describe your preferred
            poster design.
          </p>
        </div>

        <div
          className={`create-form__status ${
            serviceStatus.ready
              ? "is-ready"
              : "is-offline"
          }`}
        >
          <span className="create-form__status-dot" />

          <span>
            {serviceStatus.message}
          </span>
        </div>
      </div>

      {error && (
        <div
          className="create-form__error"
          role="alert"
        >
          <span>⚠</span>

          <p>{error}</p>

          <button
            type="button"
            aria-label="Close error"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      <section className="create-form__section">
        <div className="create-form__section-heading">
          <span className="create-form__step">
            01
          </span>

          <div>
            <h2>Upload assets</h2>

            <p>
              Add a clear student photo
              and an optional college
              logo.
            </p>
          </div>
        </div>

        <div className="create-form__upload-grid">
          <div className="create-form__upload-card">
            <div className="create-form__upload-title">
              <div>
                <h3>Student photo</h3>
                <span>Required</span>
              </div>

              <p>
                Maximum file size: 10 MB
              </p>
            </div>

            {photoPreview ? (
              <div className="create-form__preview">
                <img
                  src={photoPreview}
                  alt="Student preview"
                />

                <div className="create-form__preview-actions">
                  <label>
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={
                        handlePhotoChange
                      }
                      disabled={
                        isGenerating
                      }
                    />
                  </label>

                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={
                      isGenerating
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="create-form__dropzone">
                <span className="create-form__upload-icon">
                  ＋
                </span>

                <strong>
                  Upload student photo
                </strong>

                <small>
                  JPG, PNG, WEBP, GIF or
                  AVIF
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={
                    handlePhotoChange
                  }
                  disabled={
                    isGenerating
                  }
                />
              </label>
            )}
          </div>

          <div className="create-form__upload-card">
            <div className="create-form__upload-title">
              <div>
                <h3>College logo</h3>
                <span className="is-optional">
                  Optional
                </span>
              </div>

              <p>
                Maximum file size: 5 MB
              </p>
            </div>

            {logoPreview ? (
              <div className="create-form__preview create-form__preview--logo">
                <img
                  src={logoPreview}
                  alt="College logo preview"
                />

                <div className="create-form__preview-actions">
                  <label>
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={
                        handleLogoChange
                      }
                      disabled={
                        isGenerating
                      }
                    />
                  </label>

                  <button
                    type="button"
                    onClick={removeLogo}
                    disabled={
                      isGenerating
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="create-form__dropzone">
                <span className="create-form__upload-icon">
                  ＋
                </span>

                <strong>
                  Upload college logo
                </strong>

                <small>
                  Transparent PNG is
                  recommended
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={
                    handleLogoChange
                  }
                  disabled={
                    isGenerating
                  }
                />
              </label>
            )}
          </div>
        </div>
      </section>

      <section className="create-form__section">
        <div className="create-form__section-heading">
          <span className="create-form__step">
            02
          </span>

          <div>
            <h2>Student details</h2>

            <p>
              These details will be
              placed on the final poster.
            </p>
          </div>
        </div>

        <div className="create-form__fields">
          <div className="create-form__field create-form__field--wide">
            <label htmlFor="name">
              Student name
              <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter student name"
              maxLength={100}
              disabled={isGenerating}
              required
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="department">
              Department
            </label>

            <input
              id="department"
              name="department"
              type="text"
              value={form.department}
              onChange={handleChange}
              placeholder="Computer Science"
              maxLength={100}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="year">
              Year
            </label>

            <input
              id="year"
              name="year"
              type="text"
              value={form.year}
              onChange={handleChange}
              placeholder="Final Year"
              maxLength={50}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="rollNo">
              Roll number
            </label>

            <input
              id="rollNo"
              name="rollNo"
              type="text"
              value={form.rollNo}
              onChange={handleChange}
              placeholder="21CS104"
              maxLength={50}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="designation">
              Designation
            </label>

            <input
              id="designation"
              name="designation"
              type="text"
              value={form.designation}
              onChange={handleChange}
              placeholder="Student Coordinator"
              maxLength={80}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field create-form__field--wide">
            <label htmlFor="collegeName">
              College name
            </label>

            <input
              id="collegeName"
              name="collegeName"
              type="text"
              value={form.collegeName}
              onChange={handleChange}
              placeholder="ABC Engineering College"
              maxLength={150}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="birthdayHeading">
              Birthday heading
            </label>

            <input
              id="birthdayHeading"
              name="birthdayHeading"
              type="text"
              value={
                form.birthdayHeading
              }
              onChange={handleChange}
              placeholder="HAPPY BIRTHDAY"
              maxLength={60}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="date">
              Birthday date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field create-form__field--full">
            <label htmlFor="birthdayQuote">
              Birthday wish
            </label>

            <textarea
              id="birthdayQuote"
              name="birthdayQuote"
              value={
                form.birthdayQuote
              }
              onChange={handleChange}
              placeholder="May your birthday bring happiness, success and unforgettable memories."
              rows={4}
              maxLength={350}
              disabled={isGenerating}
            />

            <span className="create-form__character-count">
              {
                form.birthdayQuote
                  .length
              }
              /350
            </span>
          </div>
        </div>
      </section>

      <section className="create-form__section">
        <div className="create-form__section-heading">
          <span className="create-form__step">
            03
          </span>

          <div>
            <h2>
              AI design preferences
            </h2>

            <p>
              Select a visual style and
              describe the design you
              want.
            </p>
          </div>
        </div>

        <div className="create-form__style-grid">
          {STYLE_OPTIONS.map(
            (styleOption) => (
              <button
                key={
                  styleOption.value
                }
                type="button"
                className={`create-form__style-card ${
                  form.style ===
                  styleOption.value
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setForm(
                    (currentForm) => ({
                      ...currentForm,
                      style:
                        styleOption.value,
                    })
                  )
                }
                disabled={isGenerating}
              >
                <span>
                  {styleOption.label}
                </span>

                <small>
                  {
                    styleOption.description
                  }
                </small>
              </button>
            )
          )}
        </div>

        <div className="create-form__selected-style">
          Selected style:
          <strong>
            {selectedStyle.label}
          </strong>
        </div>

        <div className="create-form__fields">
          <div className="create-form__field create-form__field--full">
            <label htmlFor="prompt">
              Describe your poster
              <span>*</span>
            </label>

            <textarea
              id="prompt"
              name="prompt"
              value={form.prompt}
              onChange={handleChange}
              placeholder="Example: Premium Formula 1 birthday poster with a red racing car, dramatic speed trails, dark cinematic background, gold lighting and space for the student portrait."
              rows={6}
              maxLength={1000}
              disabled={isGenerating}
              required
            />

            <span className="create-form__character-count">
              {form.prompt.length}
              /1000
            </span>
          </div>

          <div className="create-form__field">
            <label htmlFor="theme">
              Theme
            </label>

            <input
              id="theme"
              name="theme"
              type="text"
              value={form.theme}
              onChange={handleChange}
              placeholder="Racing, royal, floral..."
              maxLength={100}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="colors">
              Preferred colors
            </label>

            <input
              id="colors"
              name="colors"
              type="text"
              value={form.colors}
              onChange={handleChange}
              placeholder="Black, red and gold"
              maxLength={100}
              disabled={isGenerating}
            />
          </div>

          <div className="create-form__field">
            <label htmlFor="variationCount">
              Number of variations
            </label>

            <select
              id="variationCount"
              name="variationCount"
              value={
                form.variationCount
              }
              onChange={handleChange}
              disabled={isGenerating}
            >
              <option value="1">
                1 poster
              </option>

              <option value="2">
                2 posters
              </option>

              <option value="3">
                3 posters
              </option>

              <option value="4">
                4 posters
              </option>

              <option value="5">
                5 posters
              </option>

              <option value="6">
                6 posters
              </option>
            </select>
          </div>

          <div className="create-form__field create-form__field--toggle">
            <label htmlFor="removeBackground">
              Remove photo background
            </label>

            <label className="create-form__switch">
              <input
                id="removeBackground"
                name="removeBackground"
                type="checkbox"
                checked={
                  form.removeBackground
                }
                onChange={handleChange}
                disabled={isGenerating}
              />

              <span className="create-form__switch-slider" />
            </label>

            <small>
              Keep enabled for a clean,
              professional portrait cutout.
            </small>
          </div>
        </div>
      </section>

      <div className="create-form__footer">
        <button
          type="button"
          className="create-form__reset-button"
          onClick={handleReset}
          disabled={isGenerating}
        >
          Reset
        </button>

        <button
          type="submit"
          className="create-form__generate-button"
          disabled={
            isGenerating ||
            serviceStatus.checking
          }
        >
          {isGenerating ? (
            <>
              <span className="create-form__spinner" />
              Generating premium
              posters...
            </>
          ) : (
            <>
              <span>✦</span>
              Generate Birthday Posters
            </>
          )}
        </button>
      </div>

      {isGenerating && (
        <div className="create-form__generating-note">
          <strong>
            SmartWish AI is creating
            your designs.
          </strong>

          <p>
            AI background generation
            and poster composition may
            take a few moments. Please
            keep this page open.
          </p>
        </div>
      )}
    </form>
  );
}

export default CreateForm;