import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, RemoteImage, Shimmer, StateMessage } from '@/core/components/primitives';
import { useContainer, useFavorites, useReviews } from '@/core/di/container';
import { failureMessage } from '@/core/i18n/i18n';
import { display, radius, spacing, useColors } from '@/core/theme/theme';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { MealSummary, previewUrl } from '@/features/meals/models';

import { MealDetailContent } from './components/MealDetailContent';
import { useMealDetail } from './useMealDetail';

const IMAGE_HEIGHT = 380;
const SHEET_OVERLAP = 32;

type Props = {
  preview: MealSummary;
  onBack: () => void;
  onWriteReview: () => void;
  onDeleteReview: () => void;
  onOpenLink: (url: string) => void;
};

/** Recipe detail. Navigation, the review sheet and links are reported to the route. */
export function MealDetailScreen({ preview, onBack, onWriteReview, onDeleteReview, onOpenLink }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mealsRepository } = useContainer();
  const { state, retry } = useMealDetail(mealsRepository, preview.id);
  const review = useReviews((store) => store.reviews[preview.id]);
  const isFavorite = useFavorites((store) => store.favorites.some((meal) => meal.id === preview.id));
  const toggleFavorite = useFavorites((store) => store.toggle);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  // Stretches on overscroll and drifts at half speed when scrolling, so the photo feels layered under the sheet.
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value < 0 ? scrollY.value : scrollY.value * 0.5 },
      { scale: scrollY.value < 0 ? interpolate(scrollY.value, [-IMAGE_HEIGHT, 0], [2, 1]) : 1 },
    ],
  }));

  const summary = state.kind === 'loaded' ? state.meal : preview;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerStyle]}>
          <RemoteImage uri={previewUrl(preview)} style={StyleSheet.absoluteFill} />
          <RemoteImage uri={summary.thumbnailUrl} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent']}
            locations={[0, 0.4]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(450).delay(120)}
          style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.xl }]}
        >
          {state.kind === 'loading' ? <DetailSkeleton title={preview.name} /> : null}
          {state.kind === 'failed' ? (
            <StateMessage
              icon="fast-food-outline"
              title={failureMessage(t, state.failure)}
              actionLabel={t('action_retry')}
              onAction={retry}
            />
          ) : null}
          {state.kind === 'loaded' ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <MealDetailContent
                meal={state.meal}
                review={review}
                onWriteReview={onWriteReview}
                onDeleteReview={onDeleteReview}
                onOpenLink={onOpenLink}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      </Animated.ScrollView>

      <View style={[styles.toolbar, { top: insets.top + spacing.sm }]}>
        <PressableScale
          scale={0.88}
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>
        <FavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(summary)} />
      </View>
    </View>
  );
}

function DetailSkeleton({ title }: { title: string }) {
  const colors = useColors();
  return (
    <View style={styles.skeleton}>
      <Text style={[display(30), { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.skeletonChips}>
        {[0, 1, 2].map((index) => (
          <Shimmer key={index} style={styles.skeletonChip} />
        ))}
      </View>
      <Shimmer style={styles.skeletonCard} />
      {[0, 1, 2, 3].map((index) => (
        <Shimmer key={index} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: IMAGE_HEIGHT },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  toolbar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  skeleton: { gap: spacing.md },
  skeletonChips: { flexDirection: 'row', gap: spacing.sm },
  skeletonChip: { width: 90, height: 34, borderRadius: 17 },
  skeletonCard: { height: 150, borderRadius: radius.lg },
  skeletonRow: { height: 64, borderRadius: radius.sm },
});
