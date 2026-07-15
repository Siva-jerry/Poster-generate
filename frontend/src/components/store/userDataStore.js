import { create } from "zustand";
import { persist } from "zustand/middleware";

function generateOwnerKey() {
  const randomPart =
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

  return `guest_${randomPart}`;
}

const initialStudentData = {
  name: "",
  department: "",
  year: "",
  rollNo: "",
  birthdayQuote:
    "Wishing you happiness, success and beautiful memories on your special day!",
  collegeName: "",
};

const initialStylePreferences = {
  category: "luxury",
  mood: "premium",
  primaryColor: "#FF6B1A",
  secondaryColor: "#7C3CFF",
  removeBackground: true,
};

const useUserDataStore = create(
  persist(
    (set, get) => ({
      ownerKey: generateOwnerKey(),

      studentData: {
        ...initialStudentData,
      },

      stylePreferences: {
        ...initialStylePreferences,
      },

      originalPhotoAsset: null,
      removedPhotoAsset: null,

      setStudentField: (
        field,
        value
      ) =>
        set((state) => ({
          studentData: {
            ...state.studentData,
            [field]: value,
          },
        })),

      setStudentData: (
        studentData
      ) =>
        set((state) => ({
          studentData: {
            ...state.studentData,
            ...studentData,
          },
        })),

      setStylePreference: (
        field,
        value
      ) =>
        set((state) => ({
          stylePreferences: {
            ...state.stylePreferences,
            [field]: value,
          },
        })),

      setOriginalPhotoAsset: (
        asset
      ) =>
        set({
          originalPhotoAsset: asset,
        }),

      setRemovedPhotoAsset: (
        asset
      ) =>
        set({
          removedPhotoAsset: asset,
        }),

      getSelectedPhotoAsset: () => {
        const state = get();

        if (
          state.stylePreferences
            .removeBackground &&
          state.removedPhotoAsset
        ) {
          return state.removedPhotoAsset;
        }

        return state.originalPhotoAsset;
      },

      resetCreateData: () =>
        set({
          studentData: {
            ...initialStudentData,
          },

          stylePreferences: {
            ...initialStylePreferences,
          },

          originalPhotoAsset: null,
          removedPhotoAsset: null,
        }),
    }),
    {
      name:
        "smartwish-user-data",

      partialize: (state) => ({
        ownerKey: state.ownerKey,
        studentData:
          state.studentData,
        stylePreferences:
          state.stylePreferences,
        originalPhotoAsset:
          state.originalPhotoAsset,
        removedPhotoAsset:
          state.removedPhotoAsset,
      }),
    }
  )
);

export default useUserDataStore;