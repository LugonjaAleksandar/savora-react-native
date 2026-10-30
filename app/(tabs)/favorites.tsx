import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useFavorites, useToast } from '@/core/di/container';
import { FavoritesScreen } from '@/features/favorites/FavoritesScreen';

/** Saved route: opens recipes and offers undo after a swipe-to-remove. */
export default function FavoritesRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const showToast = useToast((store) => store.show);
  const addFavorite = useFavorites((store) => store.add);
  return (
    <FavoritesScreen
      onOpenMeal={(meal) =>
        router.push({
          pathname: '/meal/[id]',
          params: { id: meal.id, name: meal.name, thumbnailUrl: meal.thumbnailUrl },
        })
      }
      onRemoved={(meal, index) =>
        showToast(t('favorites_removed'), { label: t('favorites_undo'), onPress: () => addFavorite(meal, index) })
      }
    />
  );
}
