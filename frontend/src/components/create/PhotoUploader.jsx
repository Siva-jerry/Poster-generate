import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./PhotoUploader.css";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maximumFileSize =
  10 * 1024 * 1024;

function PhotoUploader({
  file,
  previewUrl,
  uploading,
  progress,
  error,
  onFileChange,
  onRemove,
}) {
  const inputRef = useRef(null);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    localPreview,
    setLocalPreview,
  ] = useState(null);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setLocalPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [file]);

  const displayedPreview =
    localPreview || previewUrl;

  const validateAndSelectFile = (
    selectedFile
  ) => {
    if (!selectedFile) {
      return;
    }

    if (
      !allowedMimeTypes.includes(
        selectedFile.type
      )
    ) {
      onFileChange(
        null,
        "Only JPG, PNG and WebP images are allowed."
      );

      return;
    }

    if (
      selectedFile.size >
      maximumFileSize
    ) {
      onFileChange(
        null,
        "Image size must not exceed 10 MB."
      );

      return;
    }

    onFileChange(selectedFile, "");
  };

  const handleInputChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    validateAndSelectFile(
      selectedFile
    );

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const selectedFile =
      event.dataTransfer.files?.[0];

    validateAndSelectFile(
      selectedFile
    );
  };

  return (
    <section className="photo-uploader">
      <div className="photo-uploader__header">
        <div>
          <span>Student Photo</span>

          <h3>
            Upload a clear portrait
          </h3>

          <p>
            Use a front-facing or
            full-body image with good
            lighting.
          </p>
        </div>

        {displayedPreview && (
          <span className="photo-uploader__ready">
            <CheckCircle2
              size={16}
            />
            Ready
          </span>
        )}
      </div>

      {!displayedPreview ? (
        <button
          type="button"
          className={[
            "photo-uploader__dropzone",
            isDragging
              ? "photo-uploader__dropzone--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            inputRef.current?.click()
          }
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() =>
            setIsDragging(false)
          }
          onDrop={handleDrop}
        >
          <span className="photo-uploader__drop-icon">
            <UploadCloud
              size={30}
            />
          </span>

          <strong>
            Drop your photo here
          </strong>

          <p>
            or click to browse your
            device
          </p>

          <small>
            JPG, PNG or WebP · Maximum
            10 MB
          </small>
        </button>
      ) : (
        <div className="photo-uploader__preview">
          <div className="photo-uploader__image-wrapper">
            <img
              src={displayedPreview}
              alt="Selected student"
            />

            {uploading && (
              <div className="photo-uploader__upload-overlay">
                <LoaderCircle
                  size={29}
                  className="photo-uploader__spinner"
                />

                <strong>
                  Uploading photo
                </strong>

                <span>
                  {progress}%
                </span>

                <div className="photo-uploader__progress">
                  <span
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="photo-uploader__preview-actions">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={uploading}
            >
              <RefreshCw
                size={17}
              />
              Replace
            </button>

            <button
              type="button"
              className="photo-uploader__remove"
              onClick={onRemove}
              disabled={uploading}
            >
              <Trash2 size={17} />
              Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        hidden
      />

      {error && (
        <p className="photo-uploader__error">
          {error}
        </p>
      )}

      <div className="photo-uploader__tip">
        <ImagePlus size={18} />

        <p>
          A clean background gives the
          best automatic background
          removal result.
        </p>
      </div>
    </section>
  );
}

export default PhotoUploader;