import {
  ArrowRight,
  Check,
  LoaderCircle,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AppButton from "../common/AppButton";
import PhotoUploader from "./PhotoUploader";
import StyleSelector from "./StyleSelector";
import ColorSelector from "./ColorSelector";

import {
  removeBackground,
  uploadAsset,
} from "../../services/assetService";

import useUserDataStore from "../store/userDataStore";

import "./CreateForm.css";

const yearOptions = [
  "First Year",
  "Second Year",
  "Third Year",
  "Final Year",
  "Postgraduate",
  "Other",
];

function CreateForm() {
  const navigate = useNavigate();

  const {
    ownerKey,
    studentData,
    stylePreferences,
    originalPhotoAsset,
    removedPhotoAsset,
    setStudentField,
    setStylePreference,
    setOriginalPhotoAsset,
    setRemovedPhotoAsset,
  } = useUserDataStore();

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    photoError,
    setPhotoError,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    currentTask,
    setCurrentTask,
  ] = useState("");

  const handleFileChange = (
    file,
    errorMessage
  ) => {
    setPhotoError(
      errorMessage || ""
    );

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setOriginalPhotoAsset(null);
    setRemovedPhotoAsset(null);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPhotoError("");
    setOriginalPhotoAsset(null);
    setRemovedPhotoAsset(null);
    setUploadProgress(0);
  };

  const validateForm = () => {
    if (!studentData.name.trim()) {
      return "Student name is required.";
    }

    if (
      !studentData.department.trim()
    ) {
      return "Department is required.";
    }

    if (!studentData.year.trim()) {
      return "Year is required.";
    }

    if (!studentData.rollNo.trim()) {
      return "Roll number is required.";
    }

    if (
      !selectedFile &&
      !originalPhotoAsset
    ) {
      return "Please upload a student photo.";
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(
        validationError
      );

      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      let uploadedAsset =
        originalPhotoAsset;

      if (
        selectedFile &&
        !uploadedAsset
      ) {
        setCurrentTask(
          "Uploading student photo"
        );

        uploadedAsset =
          await uploadAsset({
            file: selectedFile,
            assetType:
              "student-photo",
            ownerKey,
            onUploadProgress:
              setUploadProgress,
          });

        setOriginalPhotoAsset(
          uploadedAsset
        );
      }

      let finalRemovedAsset =
        removedPhotoAsset;

      if (
        stylePreferences
          .removeBackground &&
        !finalRemovedAsset
      ) {
        setCurrentTask(
          "Removing photo background"
        );

        finalRemovedAsset =
          await removeBackground({
            assetId:
              uploadedAsset.id,
            ownerKey,
          });

        setRemovedPhotoAsset(
          finalRemovedAsset
        );
      }

      setCurrentTask(
        "Preparing premium designs"
      );

      navigate(
        `/templates?category=${stylePreferences.category}`
      );
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to continue."
      );
    } finally {
      setSubmitting(false);
      setCurrentTask("");
    }
  };

  const currentPreviewUrl =
    originalPhotoAsset?.publicUrl ||
    null;

  return (
    <form
      className="create-form"
      onSubmit={handleSubmit}
    >
      <div className="create-form__layout">
        <div className="create-form__main">
          <section className="create-form__card">
            <div className="create-form__card-heading">
              <span>
                <Sparkles
                  size={15}
                />
                Student Information
              </span>

              <h2>
                Enter birthday details
              </h2>

              <p>
                These values are inserted
                automatically into every
                generated poster.
              </p>
            </div>

            <div className="create-form__fields">
              <label className="create-field create-field--full">
                <span>
                  Student name
                  <strong>*</strong>
                </span>

                <input
                  type="text"
                  value={
                    studentData.name
                  }
                  placeholder="Example: Siva M"
                  onChange={(event) =>
                    setStudentField(
                      "name",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="create-field">
                <span>
                  Department
                  <strong>*</strong>
                </span>

                <input
                  type="text"
                  value={
                    studentData.department
                  }
                  placeholder="Computer Science"
                  onChange={(event) =>
                    setStudentField(
                      "department",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="create-field">
                <span>
                  Year
                  <strong>*</strong>
                </span>

                <select
                  value={
                    studentData.year
                  }
                  onChange={(event) =>
                    setStudentField(
                      "year",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select year
                  </option>

                  {yearOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="create-field">
                <span>
                  Roll number
                  <strong>*</strong>
                </span>

                <input
                  type="text"
                  value={
                    studentData.rollNo
                  }
                  placeholder="22CS101"
                  onChange={(event) =>
                    setStudentField(
                      "rollNo",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="create-field">
                <span>
                  College name
                </span>

                <input
                  type="text"
                  value={
                    studentData.collegeName
                  }
                  placeholder="ABC College"
                  onChange={(event) =>
                    setStudentField(
                      "collegeName",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="create-field create-field--full">
                <span>
                  Birthday message
                </span>

                <textarea
                  rows="4"
                  value={
                    studentData.birthdayQuote
                  }
                  maxLength="180"
                  placeholder="Write a birthday wish"
                  onChange={(event) =>
                    setStudentField(
                      "birthdayQuote",
                      event.target.value
                    )
                  }
                />

                <small>
                  {
                    studentData
                      .birthdayQuote
                      .length
                  }
                  /180
                </small>
              </label>
            </div>
          </section>

          <StyleSelector
            category={
              stylePreferences.category
            }
            mood={
              stylePreferences.mood
            }
            onCategoryChange={(
              value
            ) =>
              setStylePreference(
                "category",
                value
              )
            }
            onMoodChange={(
              value
            ) =>
              setStylePreference(
                "mood",
                value
              )
            }
          />

          <ColorSelector
            primaryColor={
              stylePreferences
                .primaryColor
            }
            secondaryColor={
              stylePreferences
                .secondaryColor
            }
            onPrimaryChange={(
              value
            ) =>
              setStylePreference(
                "primaryColor",
                value
              )
            }
            onSecondaryChange={(
              value
            ) =>
              setStylePreference(
                "secondaryColor",
                value
              )
            }
          />
        </div>

        <aside className="create-form__aside">
          <PhotoUploader
            file={selectedFile}
            previewUrl={
              currentPreviewUrl
            }
            uploading={
              submitting &&
              currentTask.includes(
                "Uploading"
              )
            }
            progress={
              uploadProgress
            }
            error={photoError}
            onFileChange={
              handleFileChange
            }
            onRemove={
              handleRemovePhoto
            }
          />

          <section className="create-form__settings">
            <div className="create-form__settings-heading">
              <WandSparkles
                size={21}
              />

              <div>
                <h3>
                  Smart photo tools
                </h3>

                <p>
                  Prepare the student
                  portrait automatically.
                </p>
              </div>
            </div>

            <label className="create-form__toggle-row">
              <div>
                <strong>
                  Remove background
                </strong>

                <span>
                  Generate a transparent
                  student cutout
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  stylePreferences
                    .removeBackground
                }
                onChange={(event) =>
                  setStylePreference(
                    "removeBackground",
                    event.target.checked
                  )
                }
              />

              <i />
            </label>

            <ul className="create-form__benefits">
              <li>
                <Check size={15} />
                Automatic photo placement
              </li>

              <li>
                <Check size={15} />
                Multiple editable layouts
              </li>

              <li>
                <Check size={15} />
                Premium colour variations
              </li>

              <li>
                <Check size={15} />
                Fonts can be changed later
              </li>
            </ul>
          </section>

          {formError && (
            <div className="create-form__error">
              {formError}
            </div>
          )}

          <div className="create-form__submit-card">
            <AppButton
              type="submit"
              size="large"
              variant="gradient"
              className="full-width"
              disabled={submitting}
              icon={
                submitting ? (
                  <LoaderCircle
                    size={19}
                    className="create-form__spinner"
                  />
                ) : (
                  <ArrowRight
                    size={19}
                  />
                )
              }
            >
              {submitting
                ? currentTask ||
                  "Preparing poster"
                : "Explore Premium Designs"}
            </AppButton>

            <p>
              Your details remain
              editable inside the design
              studio.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

export default CreateForm;