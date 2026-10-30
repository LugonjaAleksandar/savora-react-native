import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { KeyValueStore } from '@/core/storage/keyValueStore';

export const RATINGS = [1, 2, 3, 4, 5] as const;

export type Rating = (typeof RATINGS)[number];

export type MealReview = {
  mealId: string;
  rating: Rating;
  comment: string;
  updatedAt: number;
};

export type ReviewsState = {
  reviews: Record<string, MealReview>;
  save: (mealId: string, rating: Rating, comment: string) => void;
  remove: (mealId: string) => void;
};

export type ReviewsStore = ReturnType<typeof createReviewsStore>;

/** Reviews live on-device only. A remote implementation would not touch the UI. */
export const createReviewsStore = (storage: KeyValueStore, now: () => number = Date.now) =>
  createStore<ReviewsState>()(
    persist(
      (set) => ({
        reviews: {},
        save: (mealId, rating, comment) =>
          set((state) => ({
            reviews: { ...state.reviews, [mealId]: { mealId, rating, comment: comment.trim(), updatedAt: now() } },
          })),
        remove: (mealId) =>
          set((state) => {
            const { [mealId]: _removed, ...rest } = state.reviews;
            return { reviews: rest };
          }),
      }),
      { name: 'reviews', storage: createJSONStorage(() => storage), partialize: ({ reviews }) => ({ reviews }) },
    ),
  );
