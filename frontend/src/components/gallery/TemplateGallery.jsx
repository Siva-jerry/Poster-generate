import {
  ArrowDown,
  CircleAlert,
  Images,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import CategoryTabs from "./CategoryTabs";
import FilterPanel from "./FilterPanel";
import GallerySkeleton from "./GallerySkeleton";
import SearchBar from "./SearchBar";
import TemplateCard from "./TemplateCard";

import AppButton from "../common/AppButton";

import {
  fetchTemplateFilters,
  fetchTemplates,
} from "../../services/templateService";

import {
  generateTemplatePreviews,
} from "../../services/previewService";

import useTemplateStore from "../store/templateStore";
import useUserDataStore from "../store/userDataStore";

import "./TemplateGallery.css";

function TemplateGallery() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    templates,
    filters,
    pagination,
    selectedCategory,
    selectedPalette,
    selectedLayout,
    selectedSort,
    searchQuery,
    previewUrls,
    favouriteIds,

    setTemplates,
    appendTemplates,
    setFilters,
    setSelectedCategory,
    setSelectedPalette,
    setSelectedLayout,
    setSelectedSort,
    setSearchQuery,
    setSelectedTemplate,
    setMultiplePreviewUrls,
    toggleFavourite,
    resetFilters,
  } = useTemplateStore();

  const {
    studentData,
    stylePreferences,
    originalPhotoAsset,
    removedPhotoAsset,
  } = useUserDataStore();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    previewModalTemplate,
    setPreviewModalTemplate,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Read category from URL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        location.search
      );

    const categoryFromUrl =
      searchParams.get(
        "category"
      );

    if (
      categoryFromUrl &&
      categoryFromUrl !==
        selectedCategory
    ) {
      setSelectedCategory(
        categoryFromUrl
      );
    }
  }, [
    location.search,
    selectedCategory,
    setSelectedCategory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Create dynamic fields
  |--------------------------------------------------------------------------
  */

  const dynamicFields =
    useMemo(() => {
      const selectedPhoto =
        stylePreferences
          .removeBackground &&
        removedPhotoAsset
          ? removedPhotoAsset
              .publicUrl
          : originalPhotoAsset
              ?.publicUrl ||
            null;

      return {
        birthdayHeading:
          "HAPPY BIRTHDAY",

        studentName:
          studentData.name ||
          "STUDENT NAME",

        department:
          studentData.department ||
          "Department",

        year:
          studentData.year ||
          "Final Year",

        rollNo:
          studentData.rollNo ||
          "Roll Number",

        birthdayQuote:
          studentData
            .birthdayQuote ||
          "Wishing you happiness and success!",

        studentPhoto:
          selectedPhoto,

        collegeName:
          studentData
            .collegeName ||
          null,

        collegeLogo: null,
      };
    }, [
      studentData,
      stylePreferences,
      originalPhotoAsset,
      removedPhotoAsset,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Generate missing previews
  |--------------------------------------------------------------------------
  */

  const ensurePreviews =
    useCallback(
      async (
        templateItems
      ) => {
        const missingTemplateIds =
          templateItems
            .filter(
              (template) =>
                !template.preview
                  ?.url &&
                !previewUrls[
                  template.id
                ]
            )
            .map(
              (template) =>
                template.id
            )
            .slice(0, 30);

        if (
          missingTemplateIds.length ===
          0
        ) {
          return;
        }

        try {
          const results =
            await generateTemplatePreviews(
              {
                templateIds:
                  missingTemplateIds,

                width: 360,
                height: 450,
              }
            );

          const newPreviewUrls = {};

          results.forEach(
            (result) => {
              const previewUrl =
                result.preview
                  ?.previewUrl;

              if (
                result.success &&
                previewUrl
              ) {
                newPreviewUrls[
                  result.templateId
                ] = previewUrl;
              }
            }
          );

          if (
            Object.keys(
              newPreviewUrls
            ).length
          ) {
            setMultiplePreviewUrls(
              newPreviewUrls
            );
          }
        } catch (previewError) {
          console.error(
            "Preview generation failed:",
            previewError
          );
        }
      },
      [
        previewUrls,
        setMultiplePreviewUrls,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Fetch first page
  |--------------------------------------------------------------------------
  */

  const loadTemplates =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await fetchTemplates({
            page: 1,
            limit: 12,
            search:
              searchQuery,
            category:
              selectedCategory,
            palette:
              selectedPalette,
            layout:
              selectedLayout,
            sortBy:
              selectedSort,
          });

        setTemplates(
          result.templates,
          result.pagination
        );

        await ensurePreviews(
          result.templates
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load templates."
        );
      } finally {
        setLoading(false);
      }
    }, [
      searchQuery,
      selectedCategory,
      selectedPalette,
      selectedLayout,
      selectedSort,
      setTemplates,
      ensurePreviews,
    ]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  /*
  |--------------------------------------------------------------------------
  | Fetch filter values
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (filters) {
      return;
    }

    async function loadFilters() {
      try {
        const result =
          await fetchTemplateFilters();

        setFilters(result);
      } catch (filterError) {
        console.error(
          "Unable to load template filters:",
          filterError
        );
      }
    }

    loadFilters();
  }, [
    filters,
    setFilters,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load next page
  |--------------------------------------------------------------------------
  */

  const handleLoadMore =
    async () => {
      if (
        loadingMore ||
        !pagination.hasNextPage
      ) {
        return;
      }

      setLoadingMore(true);
      setError("");

      try {
        const nextPage =
          pagination.page + 1;

        const result =
          await fetchTemplates({
            page: nextPage,
            limit:
              pagination.limit ||
              12,
            search:
              searchQuery,
            category:
              selectedCategory,
            palette:
              selectedPalette,
            layout:
              selectedLayout,
            sortBy:
              selectedSort,
          });

        appendTemplates(
          result.templates,
          result.pagination
        );

        await ensurePreviews(
          result.templates
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load more templates."
        );
      } finally {
        setLoadingMore(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open editor
  |--------------------------------------------------------------------------
  */

  const handleUseTemplate = (
    template
  ) => {
    setSelectedTemplate({
      ...template,

      design: {
        ...template.design,

        dynamicFields: {
          ...template.design
            ?.dynamicFields,

          ...dynamicFields,
        },
      },
    });

    navigate(
      `/editor?templateId=${encodeURIComponent(
        template.id
      )}`
    );
  };

  const handlePreview = (
    template
  ) => {
    setPreviewModalTemplate(
      template
    );
  };

  const resolvePreviewUrl = (
    template
  ) =>
    template.preview?.url ||
    previewUrls[
      template.id
    ] ||
    null;

  return (
    <div className="template-gallery">
      <div className="template-gallery__toolbar">
        <SearchBar
          value={searchQuery}
          onChange={
            setSearchQuery
          }
        />

        <div className="template-gallery__mobile-filter">
  <FilterPanel
    filters={filters}
    selectedPalette={selectedPalette}
    selectedLayout={selectedLayout}
    selectedSort={selectedSort}
    onPaletteChange={setSelectedPalette}
    onLayoutChange={setSelectedLayout}
    onSortChange={setSelectedSort}
    onReset={resetFilters}
  />
</div>
      </div>

      <CategoryTabs
        activeCategory={
          selectedCategory
        }
        onChange={
          setSelectedCategory
        }
      />

      <div className="template-gallery__summary">
        <div>
          <Images size={18} />

          <span>
            {pagination.total || 0}
            {" "}
            premium designs
          </span>
        </div>

        {studentData.name && (
          <p>
            Creating for
            {" "}
            <strong>
              {studentData.name}
            </strong>
          </p>
        )}
      </div>

      <div className="template-gallery__content">
        <div className="template-gallery__desktop-filter">
  <FilterPanel
    filters={filters}
    selectedPalette={selectedPalette}
    selectedLayout={selectedLayout}
    selectedSort={selectedSort}
    onPaletteChange={setSelectedPalette}
    onLayoutChange={setSelectedLayout}
    onSortChange={setSelectedSort}
    onReset={resetFilters}
  />
</div>

        <div className="template-gallery__results">
          {loading ? (
            <GallerySkeleton
              count={9}
            />
          ) : error &&
            templates.length ===
              0 ? (
            <div className="template-gallery__error">
              <CircleAlert
                size={36}
              />

              <h3>
                Templates could not
                be loaded
              </h3>

              <p>{error}</p>

              <AppButton
                onClick={
                  loadTemplates
                }
                icon={
                  <RotateCcw
                    size={17}
                  />
                }
              >
                Try Again
              </AppButton>
            </div>
          ) : templates.length ===
            0 ? (
            <div className="template-gallery__empty">
              <Sparkles
                size={37}
              />

              <h3>
                No matching designs
              </h3>

              <p>
                Change your search
                term or reset the
                selected filters.
              </p>

              <AppButton
                onClick={
                  resetFilters
                }
                icon={
                  <RotateCcw
                    size={17}
                  />
                }
              >
                Reset Filters
              </AppButton>
            </div>
          ) : (
            <>
              <div className="template-gallery__grid">
                {templates.map(
                  (template) => (
                    <TemplateCard
                      key={
                        template.id
                      }
                      template={
                        template
                      }
                      previewUrl={resolvePreviewUrl(
                        template
                      )}
                      favourite={favouriteIds.includes(
                        template.id
                      )}
                      onFavourite={
                        toggleFavourite
                      }
                      onUseTemplate={
                        handleUseTemplate
                      }
                      onPreview={
                        handlePreview
                      }
                    />
                  )
                )}
              </div>

              {error && (
                <div className="template-gallery__inline-error">
                  {error}
                </div>
              )}

              {pagination.hasNextPage && (
                <div className="template-gallery__load-more">
                  <AppButton
                    variant="secondary"
                    size="large"
                    disabled={
                      loadingMore
                    }
                    onClick={
                      handleLoadMore
                    }
                    icon={
                      loadingMore ? (
                        <LoaderCircle
                          size={18}
                          className="template-gallery__spinner"
                        />
                      ) : (
                        <ArrowDown
                          size={18}
                        />
                      )
                    }
                  >
                    {loadingMore
                      ? "Loading designs"
                      : "Load More Designs"}
                  </AppButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {previewModalTemplate && (
        <div
          className="template-preview-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setPreviewModalTemplate(
                null
              );
            }
          }}
        >
          <div
            className="template-preview-modal__dialog"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="template-preview-modal__close"
              onClick={() =>
                setPreviewModalTemplate(
                  null
                )
              }
            >
              ×
            </button>

            <div className="template-preview-modal__image">
              {resolvePreviewUrl(
                previewModalTemplate
              ) ? (
                <img
                  src={resolvePreviewUrl(
                    previewModalTemplate
                  )}
                  alt={
                    previewModalTemplate.name
                  }
                />
              ) : (
                <div>
                  <Sparkles
                    size={38}
                  />

                  <strong>
                    Preview is being
                    prepared
                  </strong>
                </div>
              )}
            </div>

            <div className="template-preview-modal__content">
              <span>
                Premium Template
              </span>

              <h2>
                {
                  previewModalTemplate.name
                }
              </h2>

              <p>
                {
                  previewModalTemplate
                    .design?.layout
                    ?.name
                }
                {" · "}
                {
                  previewModalTemplate
                    .design?.palette
                    ?.name
                }
                {" · "}
                {
                  previewModalTemplate
                    .design
                    ?.typography
                    ?.name
                }
              </p>

              <AppButton
                className="full-width"
                size="large"
                variant="gradient"
                onClick={() =>
                  handleUseTemplate(
                    previewModalTemplate
                  )
                }
              >
                Edit This Design
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateGallery;