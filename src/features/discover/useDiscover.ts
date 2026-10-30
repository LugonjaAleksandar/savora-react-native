import { useCallback, useEffect, useReducer, useRef } from 'react';

import { AppFailure, CancelledError, mapResult, Result } from '@/core/network/result';
import { MealsRepository } from '@/features/meals/mealsRepository';
import { MealCategory, MealSummary, toSummary } from '@/features/meals/models';

export const SEARCH_DEBOUNCE_MS = 350;

export type DiscoverStatus = { kind: 'loading' } | { kind: 'loaded' } | { kind: 'failed'; failure: AppFailure };

export type DiscoverState = {
  status: DiscoverStatus;
  categories: MealCategory[];
  selectedCategory: MealCategory | null;
  meals: MealSummary[];
  query: string;
  isRefreshing: boolean;
  isFetchingRandomMeal: boolean;
};

type Action =
  | { type: 'categoriesLoaded'; categories: MealCategory[]; selected: MealCategory | null }
  | { type: 'categorySelected'; category: MealCategory }
  | { type: 'queryChanged'; query: string }
  | { type: 'mealsLoaded'; meals: MealSummary[] }
  | { type: 'failed'; failure: AppFailure }
  | { type: 'refreshing'; isRefreshing: boolean }
  | { type: 'fetchingRandom'; isFetching: boolean };

const initialState: DiscoverState = {
  status: { kind: 'loading' },
  categories: [],
  selectedCategory: null,
  meals: [],
  query: '',
  isRefreshing: false,
  isFetchingRandomMeal: false,
};

function reducer(state: DiscoverState, action: Action): DiscoverState {
  switch (action.type) {
    case 'categoriesLoaded':
      return { ...state, categories: action.categories, selectedCategory: action.selected };
    case 'categorySelected':
      return { ...state, selectedCategory: action.category, query: '', status: { kind: 'loading' } };
    case 'queryChanged':
      return { ...state, query: action.query, status: { kind: 'loading' } };
    case 'mealsLoaded':
      return { ...state, meals: action.meals, status: { kind: 'loaded' } };
    case 'failed':
      return { ...state, status: { kind: 'failed', failure: action.failure } };
    case 'refreshing':
      return { ...state, isRefreshing: action.isRefreshing };
    case 'fetchingRandom':
      return { ...state, isFetchingRandomMeal: action.isFetching };
  }
}

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new CancelledError());
    });
  });

/**
 * State for the Discover tab. Every load is *restartable*: starting one aborts
 * the previous request, so a slow response can never overwrite a newer
 * selection. Search is debounced the same way.
 */
export function useDiscover(repository: MealsRepository, { searchDebounceMs = SEARCH_DEBOUNCE_MS } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const latest = useRef(state);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    latest.current = state;
  }, [state]);

  const restart = useCallback(async (task: (signal: AbortSignal) => Promise<void>) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      await task(controller.signal);
    } catch (error) {
      if (!(error instanceof CancelledError)) {
        throw error;
      }
    }
  }, []);

  const apply = useCallback((result: Result<MealSummary[]>, signal: AbortSignal) => {
    if (signal.aborted) {
      return;
    }
    dispatch(result.ok ? { type: 'mealsLoaded', meals: result.data } : { type: 'failed', failure: result.failure });
  }, []);

  const loadMeals = useCallback(
    async (category: MealCategory, signal: AbortSignal) =>
      apply(await repository.mealsInCategory(category.name, { signal }), signal),
    [apply, repository],
  );

  const loadCategoriesAndMeals = useCallback(
    async (forceRefresh: boolean, signal: AbortSignal) => {
      const result = await repository.categories({ forceRefresh, signal });
      if (signal.aborted) {
        return;
      }
      if (!result.ok) {
        dispatch({ type: 'failed', failure: result.failure });
        return;
      }
      const selected = latest.current.selectedCategory ?? result.data[0] ?? null;
      dispatch({ type: 'categoriesLoaded', categories: result.data, selected });
      if (selected) {
        await loadMeals(selected, signal);
      } else {
        dispatch({ type: 'mealsLoaded', meals: [] });
      }
    },
    [loadMeals, repository],
  );

  useEffect(() => {
    void restart((signal) => loadCategoriesAndMeals(false, signal));
    return () => inFlight.current?.abort();
  }, [loadCategoriesAndMeals, restart]);

  const selectCategory = useCallback(
    (category: MealCategory) => {
      const current = latest.current;
      if (category.id === current.selectedCategory?.id && !current.query && current.status.kind === 'loaded') {
        return Promise.resolve();
      }
      dispatch({ type: 'categorySelected', category });
      latest.current = { ...current, selectedCategory: category, query: '' };
      return restart((signal) => loadMeals(category, signal));
    },
    [loadMeals, restart],
  );

  const search = useCallback(
    (text: string) => {
      const query = text.trim();
      const current = latest.current;
      if (query === current.query) {
        return Promise.resolve();
      }
      dispatch({ type: 'queryChanged', query });
      latest.current = { ...current, query };
      return restart(async (signal) => {
        if (!query) {
          if (current.selectedCategory) {
            await loadMeals(current.selectedCategory, signal);
          }
          return;
        }
        await delay(searchDebounceMs, signal);
        apply(await repository.search(query, { signal }), signal);
      });
    },
    [apply, loadMeals, repository, restart, searchDebounceMs],
  );

  const refresh = useCallback(async () => {
    dispatch({ type: 'refreshing', isRefreshing: true });
    const current = latest.current;
    await restart(async (signal) => {
      if (current.query) {
        apply(await repository.search(current.query, { signal }), signal);
      } else if (current.selectedCategory) {
        await loadMeals(current.selectedCategory, signal);
      } else {
        await loadCategoriesAndMeals(true, signal);
      }
    });
    dispatch({ type: 'refreshing', isRefreshing: false });
  }, [apply, loadCategoriesAndMeals, loadMeals, repository, restart]);

  /** The random pick is returned, not stored: navigating to it is the route's job. */
  const randomMeal = useCallback(async (): Promise<Result<MealSummary>> => {
    dispatch({ type: 'fetchingRandom', isFetching: true });
    const result = await repository.randomMeal();
    dispatch({ type: 'fetchingRandom', isFetching: false });
    return mapResult(result, toSummary);
  }, [repository]);

  return { state, selectCategory, search, refresh, randomMeal };
}
