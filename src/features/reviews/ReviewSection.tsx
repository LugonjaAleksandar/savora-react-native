import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GradientButton, RatingStars } from '@/core/components/primitives';
import { formattingLocale, ratingLabel } from '@/core/i18n/i18n';
import { brandGradient, fonts, radius, spacing, useColors } from '@/core/theme/theme';

import { MealReview } from './reviewsStore';

type Props = {
  review: MealReview | undefined;
  onWrite: () => void;
  onDelete: () => void;
};

/** Either a call to action or the saved review. Editing and deleting are reported to the route. */
export function ReviewSection({ review, onWrite, onDelete }: Props) {
  return (
    <Animated.View key={review ? 'saved' : 'cta'} entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)}>
      {review ? (
        <SavedReviewCard review={review} onEdit={onWrite} onDelete={onDelete} />
      ) : (
        <ReviewCallToAction onWrite={onWrite} />
      )}
    </Animated.View>
  );
}

function ReviewCallToAction({ onWrite }: { onWrite: () => void }) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBorder}>
      <View style={[styles.ctaInner, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('review_cta_title')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('review_cta_subtitle')}</Text>
        <View style={styles.ctaButton}>
          <GradientButton label={t('review_cta_button')} icon="star" onPress={onWrite} />
        </View>
      </View>
    </LinearGradient>
  );
}

function SavedReviewCard({
  review,
  onEdit,
  onDelete,
}: {
  review: MealReview;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const date = new Intl.DateTimeFormat(formattingLocale(i18n.language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(review.updatedAt);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.stroke }]}>
      <View style={styles.row}>
        <Text style={[styles.title, styles.flex, { color: colors.textPrimary }]}>{t('review_section_title')}</Text>
        <RatingStars rating={review.rating} size={22} />
      </View>
      <Text style={[styles.label, { color: colors.primary }]}>{ratingLabel(t, review.rating)}</Text>
      {review.comment ? <Text style={[styles.comment, { color: colors.textPrimary }]}>“{review.comment}”</Text> : null}
      <View style={[styles.row, styles.footer]}>
        <Text style={[styles.date, styles.flex, { color: colors.textTertiary }]}>
          {t('review_updated_at', { date })}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.action} accessibilityRole="button">
          <Ionicons name="pencil" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>{t('review_edit')}</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.action} accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>{t('review_delete')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaBorder: { borderRadius: radius.lg, padding: 1.5 },
  ctaInner: { borderRadius: radius.lg - 1.5, padding: spacing.lg, gap: spacing.xs },
  ctaButton: { flexDirection: 'row', marginTop: 12 },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 20 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14 },
  label: { fontFamily: fonts.bold, fontSize: 14 },
  comment: { fontFamily: fonts.regular, fontStyle: 'italic', fontSize: 16, lineHeight: 24, marginTop: spacing.sm },
  footer: { marginTop: spacing.md, gap: spacing.md },
  date: { fontFamily: fonts.regular, fontSize: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: fonts.semiBold, fontSize: 14 },
});
