import { create } from "zustand";

/*
|--------------------------------------------------------------------------
| Default editor state
|--------------------------------------------------------------------------
*/

const initialCanvasSize = {
  width: 1080,
  height: 1350,
};

const initialHistory = {
  undoStack: [],
  redoStack: [],
};

/*
|--------------------------------------------------------------------------
| Editor store
|--------------------------------------------------------------------------
*/

const useEditorStore = create(
  (set, get) => ({
    /*
    |--------------------------------------------------------------------------
    | Fabric canvas instance
    |--------------------------------------------------------------------------
    */

    canvas: null,
    canvasElement: null,

    setCanvas: (
      canvas,
      canvasElement = null
    ) =>
      set({
        canvas,
        canvasElement,
      }),

    clearCanvasReference: () =>
      set({
        canvas: null,
        canvasElement: null,
      }),

    /*
    |--------------------------------------------------------------------------
    | Canvas information
    |--------------------------------------------------------------------------
    */

    canvasSize: {
      ...initialCanvasSize,
    },

    setCanvasSize: (
      width,
      height
    ) =>
      set({
        canvasSize: {
          width:
            Number(width) ||
            initialCanvasSize.width,

          height:
            Number(height) ||
            initialCanvasSize.height,
        },
      }),

    /*
    |--------------------------------------------------------------------------
    | Zoom
    |--------------------------------------------------------------------------
    */

    zoom: 60,

    setZoom: (zoom) => {
      const safeZoom = Math.min(
        Math.max(
          Number(zoom) || 60,
          10
        ),
        250
      );

      set({
        zoom: safeZoom,
      });
    },

    zoomIn: () => {
      const currentZoom =
        get().zoom;

      set({
        zoom: Math.min(
          currentZoom + 10,
          250
        ),
      });
    },

    zoomOut: () => {
      const currentZoom =
        get().zoom;

      set({
        zoom: Math.max(
          currentZoom - 10,
          10
        ),
      });
    },

    /*
    |--------------------------------------------------------------------------
    | Selected object
    |--------------------------------------------------------------------------
    */

    selectedObject: null,
    selectedObjectId: null,
    selectedObjectType: null,

    setSelectedObject: (
      object
    ) => {
      if (!object) {
        set({
          selectedObject: null,
          selectedObjectId: null,
          selectedObjectType: null,
        });

        return;
      }

      set({
        selectedObject: object,

        selectedObjectId:
          object.editorId ||
          object.id ||
          null,

        selectedObjectType:
          object.editorType ||
          object.type ||
          null,
      });
    },

    clearSelectedObject: () =>
      set({
        selectedObject: null,
        selectedObjectId: null,
        selectedObjectType: null,
      }),

    /*
    |--------------------------------------------------------------------------
    | Active sidebar tool
    |--------------------------------------------------------------------------
    */

    activeTool: "templates",
    toolPanelOpen: true,

    setActiveTool: (
      activeTool
    ) =>
      set({
        activeTool,
        toolPanelOpen: true,
      }),

    setToolPanelOpen: (
      toolPanelOpen
    ) =>
      set({
        toolPanelOpen:
          Boolean(toolPanelOpen),
      }),

    toggleToolPanel: () =>
      set((state) => ({
        toolPanelOpen:
          !state.toolPanelOpen,
      })),

    /*
    |--------------------------------------------------------------------------
    | Document information
    |--------------------------------------------------------------------------
    */

    designId: null,
    editToken: null,

    documentTitle:
      "Untitled Birthday Poster",

    setDesignIdentity: ({
      designId,
      editToken,
    }) =>
      set({
        designId:
          designId || null,

        editToken:
          editToken || null,
      }),

    setDocumentTitle: (
      documentTitle
    ) =>
      set({
        documentTitle:
          String(
            documentTitle ||
              "Untitled Birthday Poster"
          ).trim(),
      }),

    /*
    |--------------------------------------------------------------------------
    | Template information
    |--------------------------------------------------------------------------
    */

    templateId: null,
    loadedTemplate: null,

    setLoadedTemplate: (
      template
    ) =>
      set({
        templateId:
          template?.id || null,

        loadedTemplate:
          template || null,
      }),

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    pages: [
      {
        id: "page-1",
        name: "Page 1",
        canvasJson: null,
        thumbnail: null,
      },
    ],

    activePageId: "page-1",

    setPages: (pages) =>
      set({
        pages:
          Array.isArray(pages) &&
          pages.length > 0
            ? pages
            : [
                {
                  id: "page-1",
                  name: "Page 1",
                  canvasJson: null,
                  thumbnail: null,
                },
              ],
      }),

    setActivePageId: (
      activePageId
    ) =>
      set({
        activePageId,
      }),

    addPage: () => {
      const currentPages =
        get().pages;

      const newPage = {
        id: `page-${Date.now()}`,
        name:
          `Page ${
            currentPages.length + 1
          }`,
        canvasJson: null,
        thumbnail: null,
      };

      set({
        pages: [
          ...currentPages,
          newPage,
        ],

        activePageId:
          newPage.id,
      });

      return newPage;
    },

    updatePage: (
      pageId,
      updates
    ) =>
      set((state) => ({
        pages:
          state.pages.map(
            (page) =>
              page.id === pageId
                ? {
                    ...page,
                    ...updates,
                  }
                : page
          ),
      })),

    removePage: (
      pageId
    ) => {
      const currentPages =
        get().pages;

      if (
        currentPages.length <= 1
      ) {
        return;
      }

      const pageIndex =
        currentPages.findIndex(
          (page) =>
            page.id === pageId
        );

      const nextPages =
        currentPages.filter(
          (page) =>
            page.id !== pageId
        );

      const nextActivePage =
        nextPages[
          Math.max(
            pageIndex - 1,
            0
          )
        ] || nextPages[0];

      set({
        pages: nextPages,
        activePageId:
          nextActivePage.id,
      });
    },

    /*
    |--------------------------------------------------------------------------
    | History
    |--------------------------------------------------------------------------
    */

    history: {
      ...initialHistory,
    },

    historyProcessing: false,

    setHistoryProcessing: (
      historyProcessing
    ) =>
      set({
        historyProcessing:
          Boolean(
            historyProcessing
          ),
      }),

    pushHistoryState: (
      serializedCanvas
    ) => {
      if (
        !serializedCanvas ||
        get().historyProcessing
      ) {
        return;
      }

      set((state) => {
        const undoStack = [
          ...state.history
            .undoStack,
          serializedCanvas,
        ];

        /*
         * Limit history to 50 states
         * to prevent excessive memory use.
         */
        const limitedUndoStack =
          undoStack.slice(-50);

        return {
          history: {
            undoStack:
              limitedUndoStack,

            redoStack: [],
          },
        };
      });
    },

    setHistory: (
      undoStack = [],
      redoStack = []
    ) =>
      set({
        history: {
          undoStack:
            Array.isArray(
              undoStack
            )
              ? undoStack
              : [],

          redoStack:
            Array.isArray(
              redoStack
            )
              ? redoStack
              : [],
        },
      }),

    clearHistory: () =>
      set({
        history: {
          ...initialHistory,
        },
      }),

    /*
    |--------------------------------------------------------------------------
    | Saving state
    |--------------------------------------------------------------------------
    */

    isDirty: false,
    isSaving: false,
    lastSavedAt: null,

    setDirty: (
      isDirty = true
    ) =>
      set({
        isDirty:
          Boolean(isDirty),
      }),

    setSaving: (
      isSaving
    ) =>
      set({
        isSaving:
          Boolean(isSaving),
      }),

    markSaved: () =>
      set({
        isDirty: false,
        isSaving: false,
        lastSavedAt:
          new Date().toISOString(),
      }),

    /*
    |--------------------------------------------------------------------------
    | Loading and errors
    |--------------------------------------------------------------------------
    */

    loadingTemplate: false,
    editorReady: false,
    editorError: "",

    setLoadingTemplate: (
      loadingTemplate
    ) =>
      set({
        loadingTemplate:
          Boolean(
            loadingTemplate
          ),
      }),

    setEditorReady: (
      editorReady
    ) =>
      set({
        editorReady:
          Boolean(editorReady),
      }),

    setEditorError: (
      editorError
    ) =>
      set({
        editorError:
          String(
            editorError || ""
          ),
      }),

    /*
    |--------------------------------------------------------------------------
    | Reset editor
    |--------------------------------------------------------------------------
    */

    resetEditor: () =>
      set({
        canvas: null,
        canvasElement: null,

        canvasSize: {
          ...initialCanvasSize,
        },

        zoom: 60,

        selectedObject: null,
        selectedObjectId: null,
        selectedObjectType: null,

        activeTool: "templates",
        toolPanelOpen: true,

        designId: null,
        editToken: null,

        documentTitle:
          "Untitled Birthday Poster",

        templateId: null,
        loadedTemplate: null,

        pages: [
          {
            id: "page-1",
            name: "Page 1",
            canvasJson: null,
            thumbnail: null,
          },
        ],

        activePageId: "page-1",

        history: {
          ...initialHistory,
        },

        historyProcessing: false,

        isDirty: false,
        isSaving: false,
        lastSavedAt: null,

        loadingTemplate: false,
        editorReady: false,
        editorError: "",
      }),
  })
);

export default useEditorStore;