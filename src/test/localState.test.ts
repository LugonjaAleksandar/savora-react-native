import { formattingLocale, i18n } from '@/core/i18n/i18n';
import { InMemoryKeyValueStore } from '@/core/storage/keyValueStore';
import { createFavoritesStore } from '@/features/favorites/favoritesStore';
import { createReviewsStore } from '@/features/reviews/reviewsStore';
import { createSettingsStore } from '@/features/settings/settingsStore';

import { summary } from './fixtures';

describe('favorites', () => {
  it('persists across launches', async () => {
    const storage = new InMemoryKeyValueStore();
    createFavoritesStore(storage).getState().toggle(summary);

    const relaunched = createFavoritesStore(storage);
    await relaunched.persist.rehydrate();

    expect(relaunched.getState().favorites).toEqual([summary]);
  });

  it('restores an undone removal to its original position', () => {
    const store = createFavoritesStore(new InMemoryKeyValueStore());
    const meals = [1, 2, 3].map((id) => ({ ...summary, id: String(id) }));
    [...meals].reverse().forEach((meal) => store.getState().add(meal));

    const index = store.getState().remove('2');
    store.getState().add(meals[1]!, index ?? 0);

    expect(store.getState().favorites.map((meal) => meal.id)).toEqual(['1', '2', '3']);
  });
});

describe('reviews', () => {
  it('trims and timestamps a saved review, and deletes it', () => {
    const store = createReviewsStore(new InMemoryKeyValueStore(), () => 42);

    store.getState().save('1', 4, '  More garlic  ');
    expect(store.getState().reviews['1']).toEqual({ mealId: '1', rating: 4, comment: 'More garlic', updatedAt: 42 });

    store.getState().remove('1');
    expect(store.getState().reviews['1']).toBeUndefined();
  });
});

describe('settings', () => {
  it('defaults to English and the system theme on first launch', () => {
    const state = createSettingsStore(new InMemoryKeyValueStore()).getState();

    expect(state.language).toBe('en');
    expect(state.theme).toBe('system');
  });

  it('remembers an explicit system language choice', async () => {
    const storage = new InMemoryKeyValueStore();
    createSettingsStore(storage).getState().setLanguage('system');

    const relaunched = createSettingsStore(storage);
    await relaunched.persist.rehydrate();

    expect(relaunched.getState().language).toBe('system');
  });
});

describe('i18n', () => {
  it.each([
    [0, 'Nema recepata'],
    [1, '1 recept'],
    [3, '3 recepta'],
    [5, '5 recepata'],
    [21, '21 recept'],
  ])('Serbian plural for %i is "%s"', (count, expected) => {
    expect(i18n.getFixedT('sr')('meals_count', { count })).toBe(expected);
  });

  it('resolves English copy and plurals', () => {
    const t = i18n.getFixedT('en');

    expect(t('nav_discover')).toBe('Discover');
    expect(t('meals_count', { count: 1 })).toBe('1 recipe');
    expect(t('meals_section_category', { category: 'Beef' })).toBe('Beef recipes');
  });

  it('formats Serbian dates in Latin script, like the copy', () => {
    const date = new Intl.DateTimeFormat(formattingLocale('sr'), { month: 'short' }).format(new Date(2026, 9, 30));

    expect(date).toMatch(/^[a-z.]+$/i);
  });
});
