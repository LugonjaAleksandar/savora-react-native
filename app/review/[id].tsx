import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useReviews, useToast } from '@/core/di/container';
import { ReviewSheet } from '@/features/reviews/ReviewSheet';

/** Review sheet route (a native form sheet): saves, confirms and dismisses itself. */
export default function ReviewRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const review = useReviews((store) => store.reviews[id]);
  const saveReview = useReviews((store) => store.save);
  const showToast = useToast((store) => store.show);

  return (
    <ReviewSheet
      initialReview={review}
      onSave={(rating, comment) => {
        saveReview(id, rating, comment);
        router.back();
        showToast(t('review_saved'));
      }}
    />
  );
}
