import { createContext, ReactNode, useContext } from 'react';
import { useStore } from 'zustand';

import { createToastStore, ToastState, ToastStore } from '@/core/components/toastStore';
import { ApiClient, Fetch } from '@/core/network/apiClient';
import { AsyncStorageKeyValueStore, KeyValueStore } from '@/core/storage/keyValueStore';
import { createFavoritesStore, FavoritesState, FavoritesStore } from '@/features/favorites/favoritesStore';
import { MealsApi } from '@/features/meals/mealsApi';
import { MealsCache } from '@/features/meals/mealsCache';
import { DefaultMealsRepository, MealsRepository } from '@/features/meals/mealsRepository';
import { createReviewsStore, ReviewsState, ReviewsStore } from '@/features/reviews/reviewsStore';
import { createSettingsStore, SettingsState, SettingsStore } from '@/features/settings/settingsStore';

export const MEAL_DB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

export type Container = {
  mealsRepository: MealsRepository;
  favoritesStore: FavoritesStore;
  reviewsStore: ReviewsStore;
  settingsStore: SettingsStore;
  toastStore: ToastStore;
};

/**
 * Composition root: the only place concrete implementations are chosen.
 * Everything below receives its dependencies through this container, so tests
 * can build one with fakes.
 */
export function createContainer({
  fetchFn = fetch,
  storage = new AsyncStorageKeyValueStore(),
  now = Date.now,
}: { fetchFn?: Fetch; storage?: KeyValueStore; now?: () => number } = {}): Container {
  const api = new MealsApi(new ApiClient(fetchFn, MEAL_DB_BASE_URL));
  return {
    mealsRepository: new DefaultMealsRepository(api, new MealsCache(storage, now)),
    favoritesStore: createFavoritesStore(storage),
    reviewsStore: createReviewsStore(storage, now),
    settingsStore: createSettingsStore(storage),
    toastStore: createToastStore(),
  };
}

const ContainerContext = createContext<Container | null>(null);

export function ContainerProvider({ container, children }: { container: Container; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): Container {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('useContainer must be used inside ContainerProvider');
  }
  return container;
}

export const useFavorites = <T,>(selector: (state: FavoritesState) => T) =>
  useStore(useContainer().favoritesStore, selector);

export const useReviews = <T,>(selector: (state: ReviewsState) => T) => useStore(useContainer().reviewsStore, selector);

export const useSettings = <T,>(selector: (state: SettingsState) => T) =>
  useStore(useContainer().settingsStore, selector);

export const useToast = <T,>(selector: (state: ToastState) => T) => useStore(useContainer().toastStore, selector);
