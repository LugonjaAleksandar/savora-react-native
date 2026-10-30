import { act, renderHook, waitFor } from '@testing-library/react-native';

import { failure } from '@/core/network/result';
import { categories, FakeMealsRepository, summary } from '@/test/fixtures';

import { useDiscover } from '../useDiscover';

describe('useDiscover', () => {
  let repository: FakeMealsRepository;

  beforeEach(() => {
    repository = new FakeMealsRepository();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts by loading categories and the first category', async () => {
    const { result } = await renderHook(() => useDiscover(repository));

    await waitFor(() => expect(result.current.state.status.kind).toBe('loaded'));
    expect(result.current.state.selectedCategory?.name).toBe('Beef');
    expect(result.current.state.meals).toEqual([summary]);
    expect(repository.requestedCategories).toEqual(['Beef']);
  });

  it('selecting a category loads its meals', async () => {
    const { result } = await renderHook(() => useDiscover(repository));
    await waitFor(() => expect(result.current.state.status.kind).toBe('loaded'));

    await act(() => result.current.selectCategory(categories[1]!));

    expect(result.current.state.selectedCategory?.name).toBe('Chicken');
    expect(repository.requestedCategories).toEqual(['Beef', 'Chicken']);
  });

  it('debounces search so only the last query hits the repository', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useDiscover(repository));
    await waitFor(() => expect(result.current.state.status.kind).toBe('loaded'));

    await act(async () => {
      void result.current.search('c');
      await jest.advanceTimersByTimeAsync(100);
      void result.current.search('ch');
      await jest.advanceTimersByTimeAsync(100);
      void result.current.search('chicken');
      await jest.advanceTimersByTimeAsync(400);
    });

    expect(repository.searchedQueries).toEqual(['chicken']);
    expect(result.current.state.query).toBe('chicken');
  });

  it('surfaces a failure to load categories', async () => {
    repository.categoriesResult = failure({ kind: 'network' });

    const { result } = await renderHook(() => useDiscover(repository));

    await waitFor(() => expect(result.current.state.status).toEqual({ kind: 'failed', failure: { kind: 'network' } }));
  });

  it('returns the random pick instead of navigating', async () => {
    const { result } = await renderHook(() => useDiscover(repository));
    await waitFor(() => expect(result.current.state.status.kind).toBe('loaded'));

    let pick: Awaited<ReturnType<typeof result.current.randomMeal>> | undefined;
    await act(async () => {
      pick = await result.current.randomMeal();
    });

    expect(pick).toEqual({ ok: true, data: summary });
  });
});
