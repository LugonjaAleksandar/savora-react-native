import { MEAL_DB_BASE_URL } from '@/core/di/container';
import { ApiClient } from '@/core/network/apiClient';
import { success } from '@/core/network/result';
import { InMemoryKeyValueStore } from '@/core/storage/keyValueStore';
import { categoriesJson, detailJson, listingJson, stubFetch, summary } from '@/test/fixtures';

import { decodeMealDetail, MealsApi } from '../mealsApi';
import { MealsCache } from '../mealsCache';
import { DefaultMealsRepository } from '../mealsRepository';
import { mealSteps } from '../models';

const HOUR = 60 * 60 * 1000;

function setUp(...replies: Parameters<typeof stubFetch>) {
  const { fetchFn, urls } = stubFetch(...replies);
  const store = new InMemoryKeyValueStore();
  const clock = { now: 1_700_000_000_000 };
  const repository = new DefaultMealsRepository(
    new MealsApi(new ApiClient(fetchFn, MEAL_DB_BASE_URL)),
    new MealsCache(store, () => clock.now),
  );
  return { repository, urls, store, clock };
}

describe('ApiClient + MealsApi', () => {
  it('builds the query and decodes listings', async () => {
    const { repository, urls } = setUp(listingJson);

    await expect(repository.mealsInCategory('Sea food')).resolves.toEqual(success([summary]));
    expect(urls).toEqual(['https://www.themealdb.com/api/json/v1/1/filter.php?c=Sea%20food']);
  });

  it.each([
    [404, { kind: 'notFound' }],
    [503, { kind: 'server', status: 503 }],
    ['<html>', { kind: 'parsing' }],
    [new TypeError('Network request failed'), { kind: 'network' }],
  ])('maps %p to a typed failure', async (reply, expected) => {
    const { repository } = setUp(reply);

    await expect(repository.search('a')).resolves.toEqual({ ok: false, failure: expected });
  });

  it('treats an unknown meal as not found', async () => {
    const { repository } = setUp({ meals: null });

    await expect(repository.meal('0')).resolves.toEqual({ ok: false, failure: { kind: 'notFound' } });
  });
});

describe('DefaultMealsRepository caching', () => {
  it('serves categories from cache within the TTL and refetches after it', async () => {
    const { repository, urls, clock } = setUp(categoriesJson, categoriesJson);

    await repository.categories();
    clock.now += HOUR;
    await repository.categories();
    expect(urls).toHaveLength(1);

    clock.now += DefaultMealsRepository.categoriesTtlMs;
    await repository.categories();
    expect(urls).toHaveLength(2);
  });

  it('falls back to a stale category listing when offline', async () => {
    const { repository, clock } = setUp(listingJson, new TypeError('Network request failed'));

    await repository.mealsInCategory('Chicken');
    clock.now += 30 * 24 * HOUR;

    await expect(repository.mealsInCategory('Chicken')).resolves.toEqual(success([summary]));
  });

  it('does not mask server errors with the cache', async () => {
    const { repository } = setUp(listingJson, 500);

    await repository.mealsInCategory('Chicken');

    await expect(repository.mealsInCategory('Chicken')).resolves.toEqual({
      ok: false,
      failure: { kind: 'server', status: 500 },
    });
  });

  it('warms the detail cache with the random pick', async () => {
    const { repository, urls } = setUp({ meals: [detailJson] });

    const random = await repository.randomMeal();
    const opened = await repository.meal(summary.id);

    expect(opened).toEqual(random);
    expect(urls).toHaveLength(1);
  });

  it('drops corrupt cache entries', async () => {
    const { store } = setUp();
    await store.setItem('meals_cache_categories', 'not json');

    await expect(new MealsCache(store).read('categories', null)).resolves.toBeNull();
    await expect(store.getItem('meals_cache_categories')).resolves.toBeNull();
  });
});

describe('meal parsing', () => {
  const meal = decodeMealDetail(detailJson);

  it('parses flattened ingredients and skips blanks', () => {
    expect(meal.ingredients).toEqual([
      { name: 'soy sauce', measure: '3/4 cup' },
      { name: 'water', measure: '' },
    ]);
  });

  it('splits instructions into steps without headings', () => {
    expect(mealSteps(meal)).toEqual(['Preheat oven to 350F.', 'Combine soy sauce and water.']);
  });

  it('normalises blank fields and tags', () => {
    expect(meal.name).toBe('Teriyaki Chicken Casserole');
    expect(meal.area).toBeNull();
    expect(meal.sourceUrl).toBeNull();
    expect(meal.tags).toEqual(['Meat', 'Casserole']);
  });
});
