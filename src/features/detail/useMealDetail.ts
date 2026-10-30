import { useCallback, useEffect, useState } from 'react';

import { AppFailure, CancelledError } from '@/core/network/result';
import { MealsRepository } from '@/features/meals/mealsRepository';
import { MealDetail } from '@/features/meals/models';

export type MealDetailState =
  { kind: 'loading' } | { kind: 'loaded'; meal: MealDetail } | { kind: 'failed'; failure: AppFailure };

export function useMealDetail(repository: MealsRepository, mealId: string) {
  const [state, setState] = useState<MealDetailState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    repository
      .meal(mealId, { signal: controller.signal })
      .then((result) =>
        setState(result.ok ? { kind: 'loaded', meal: result.data } : { kind: 'failed', failure: result.failure }),
      )
      .catch((error: unknown) => {
        if (!(error instanceof CancelledError)) {
          throw error;
        }
      });
    return () => controller.abort();
  }, [repository, mealId, attempt]);

  const retry = useCallback(() => {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return { state, retry };
}
