import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTemplateStore = create(
  persist(
    (set, get) => ({
      templates: [],

      filters: null,

      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },

      selectedCategory: "all",
      selectedPalette: "all",
      selectedLayout: "all",
      selectedSort: "trending",
      searchQuery: "",

      selectedTemplate: null,

      previewUrls: {},

      favouriteIds: [],

      setTemplates: (
        templates,
        pagination
      ) =>
        set({
          templates,
          pagination,
        }),

      appendTemplates: (
        templates,
        pagination
      ) =>
        set((state) => {
          const existingIds = new Set(
            state.templates.map(
              (template) =>
                template.id
            )
          );

          const uniqueNewTemplates =
            templates.filter(
              (template) =>
                !existingIds.has(
                  template.id
                )
            );

          return {
            templates: [
              ...state.templates,
              ...uniqueNewTemplates,
            ],

            pagination,
          };
        }),

      setFilters: (filters) =>
        set({
          filters,
        }),

      setSelectedCategory: (
        selectedCategory
      ) =>
        set({
          selectedCategory,
          pagination: {
            ...get().pagination,
            page: 1,
          },
        }),

      setSelectedPalette: (
        selectedPalette
      ) =>
        set({
          selectedPalette,
          pagination: {
            ...get().pagination,
            page: 1,
          },
        }),

      setSelectedLayout: (
        selectedLayout
      ) =>
        set({
          selectedLayout,
          pagination: {
            ...get().pagination,
            page: 1,
          },
        }),

      setSelectedSort: (
        selectedSort
      ) =>
        set({
          selectedSort,
          pagination: {
            ...get().pagination,
            page: 1,
          },
        }),

      setSearchQuery: (
        searchQuery
      ) =>
        set({
          searchQuery,
          pagination: {
            ...get().pagination,
            page: 1,
          },
        }),

      setSelectedTemplate: (
        selectedTemplate
      ) =>
        set({
          selectedTemplate,
        }),

      setPreviewUrl: (
        templateId,
        previewUrl
      ) =>
        set((state) => ({
          previewUrls: {
            ...state.previewUrls,
            [templateId]:
              previewUrl,
          },
        })),

      setMultiplePreviewUrls: (
        previewEntries
      ) =>
        set((state) => ({
          previewUrls: {
            ...state.previewUrls,
            ...previewEntries,
          },
        })),

      toggleFavourite: (
        templateId
      ) =>
        set((state) => {
          const alreadyFavourite =
            state.favouriteIds.includes(
              templateId
            );

          return {
            favouriteIds:
              alreadyFavourite
                ? state.favouriteIds.filter(
                    (id) =>
                      id !==
                      templateId
                  )
                : [
                    ...state.favouriteIds,
                    templateId,
                  ],
          };
        }),

      clearTemplateResults: () =>
        set({
          templates: [],

          pagination: {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),

      resetFilters: () =>
        set({
          selectedCategory:
            "all",
          selectedPalette:
            "all",
          selectedLayout:
            "all",
          selectedSort:
            "trending",
          searchQuery: "",
        }),
    }),
    {
      name:
        "smartwish-template-store",

      partialize: (state) => ({
        favouriteIds:
          state.favouriteIds,

        selectedCategory:
          state.selectedCategory,

        selectedPalette:
          state.selectedPalette,

        selectedLayout:
          state.selectedLayout,

        selectedSort:
          state.selectedSort,
      }),
    }
  )
);

export default useTemplateStore;