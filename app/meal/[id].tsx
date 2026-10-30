import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { useReviews, useToast } from '@/core/di/container';
import { MealDetailScreen } from '@/features/detail/MealDetailScreen';

/** Recipe route: owns going back, presenting the review sheet, confirming deletes and opening links. */
export default function MealRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, name, thumbnailUrl } = useLocalSearchParams<{ id: string; name: string; thumbnailUrl: string }>();
  const removeReview = useReviews((store) => store.remove);
  const showToast = useToast((store) => store.show);

  return (
    <MealDetailScreen
      preview={{ id, name, thumbnailUrl }}
      onBack={() => router.back()}
      onWriteReview={() => router.push({ pathname: '/review/[id]', params: { id } })}
      onDeleteReview={() => {
        removeReview(id);
        showToast(t('review_deleted'));
      }}
      onOpenLink={(url) => void Linking.openURL(url)}
    />
  );
}
