import { RequestOptions } from '@/core/network/apiClient';
import { Result, success } from '@/core/network/result';

import { MealsApi } from './mealsApi';
import { MealsCache } from './mealsCache';
import { MealCategory, MealDetail, MealSummary } from './models';

export interface MealsRepository {
  categories(options?: RequestOptions & { forceRefresh?: boolean }): Promise<Result<MealCategory[]>>;
  mealsInCategory(category: string, options?: RequestOptions): Promise<Result<MealSummary[]>>;
  search(query: string, options?: RequestOptions): Promise<Result<MealSummary[]>>;
  meal(id: string, options?: RequestOptions): Promise<Result<MealDetail>>;
  randomMeal(options?: RequestOptions): Promise<Result<MealDetail>>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Caching strategy:
 * - categories and meal details change rarely, so they are **cache-first** with a TTL;
 * - category listings are **network-first**, falling back to the last cached copy when offline;
 * - search is network only (results are cheap and query-specific).
 */
export class DefaultMealsRepository implements MealsRepository {
  static readonly categoriesTtlMs = DAY_MS;
  static readonly mealDetailTtlMs = 7 * DAY_MS;

  constructor(
    private readonly api: MealsApi,
    private readonly cache: MealsCache,
  ) {}

  async categories({ forceRefresh = false, ...options }: RequestOptions & { forceRefresh?: boolean } = {}) {
    if (!forceRefresh) {
      const cached = await this.cache.read<MealCategory[]>('categories', DefaultMealsRepository.categoriesTtlMs);
      if (cached) {
        return success(cached);
      }
    }
    return this.fetchAndCache('categories', () => this.api.categories(options));
  }

  mealsInCategory(category: string, options?: RequestOptions) {
    return this.fetchAndCache(`category_${category}`, () => this.api.mealsByCategory(category, options));
  }

  search(query: string, options?: RequestOptions) {
    return this.api.search(query, options);
  }

  async meal(id: string, options?: RequestOptions) {
    const key = `meal_${id}`;
    const cached = await this.cache.read<MealDetail>(key, DefaultMealsRepository.mealDetailTtlMs);
    if (cached) {
      return success(cached);
    }
    return this.fetchAndCache(key, () => this.api.lookup(id, options));
  }

  /** Warms the detail cache, so opening the random pick right after is instant. */
  async randomMeal(options?: RequestOptions) {
    const result = await this.api.random(options);
    if (result.ok) {
      await this.cache.write(`meal_${result.data.id}`, result.data);
    }
    return result;
  }

  /**
   * On success persists the value; on a network failure serves whatever is
   * cached (ignoring the TTL), so the app stays usable offline.
   */
  private async fetchAndCache<T>(key: string, fetch: () => Promise<Result<T>>): Promise<Result<T>> {
    const result = await fetch();
    if (result.ok) {
      await this.cache.write(key, result.data);
      return result;
    }
    if (result.failure.kind === 'network') {
      const stale = await this.cache.read<T>(key, null);
      if (stale !== null) {
        return success(stale);
      }
    }
    return result;
  }
}
