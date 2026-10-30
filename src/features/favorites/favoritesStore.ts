import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { KeyValueStore } from '@/core/storage/keyValueStore';
import { MealSummary, toSummary } from '@/features/meals/models';

export type FavoritesState = {
  /** Full summaries (not just ids), so the Saved tab renders instantly and offline. */
  favorites: MealSummary[];
  toggle: (meal: MealSummary) => void;
  /** New favorites go to the top; `index` restores a removed one to where it was. */
  add: (meal: MealSummary, index?: number) => void;
  /** Returns the removed position, so the caller can offer an undo. */
  remove: (mealId: string) => number | null;
};

export type FavoritesStore = ReturnType<typeof createFavoritesStore>;

/** App-wide, because the heart appears on grid cards, the detail screen and the Saved tab at once. */
export const createFavoritesStore = (storage: KeyValueStore) =>
  createStore<FavoritesState>()(
    persist(
      (set, get) => ({
        favorites: [],
        toggle: (meal) => {
          if (get().favorites.some((item) => item.id === meal.id)) {
            get().remove(meal.id);
          } else {
            get().add(meal);
          }
        },
        add: (meal, index = 0) => {
          const { favorites } = get();
          if (favorites.some((item) => item.id === meal.id)) {
            return;
          }
          const updated = [...favorites];
          updated.splice(Math.min(Math.max(index, 0), updated.length), 0, toSummary(meal));
          set({ favorites: updated });
        },
        remove: (mealId) => {
          const { favorites } = get();
          const index = favorites.findIndex((item) => item.id === mealId);
          if (index < 0) {
            return null;
          }
          set({ favorites: favorites.filter((item) => item.id !== mealId) });
          return index;
        },
      }),
      { name: 'favorites', storage: createJSONStorage(() => storage), partialize: ({ favorites }) => ({ favorites }) },
    ),
  );
