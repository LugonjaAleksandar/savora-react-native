import { useRouter } from 'expo-router';

import { useToast } from '@/core/di/container';
import { DiscoverScreen } from '@/features/discover/DiscoverScreen';

/** Discover route: decides where taps lead; the screen and its cards only report them. */
export default function DiscoverRoute() {
  const router = useRouter();
  const showToast = useToast((store) => store.show);
  return (
    <DiscoverScreen
      onOpenMeal={(meal) =>
        router.push({
          pathname: '/meal/[id]',
          params: { id: meal.id, name: meal.name, thumbnailUrl: meal.thumbnailUrl },
        })
      }
      onRandomMealFailed={(message) => showToast(message)}
    />
  );
}
