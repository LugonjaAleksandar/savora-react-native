import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PressableScale } from '@/core/components/primitives';
import { ratingLabel } from '@/core/i18n/i18n';
import { brandGradient, display, fonts, radius, spacing, useColors } from '@/core/theme/theme';

import { MealReview, Rating, RATINGS } from './reviewsStore';

type Props = {
  initialReview: MealReview | undefined;
  onSave: (rating: Rating, comment: string) => void;
};

export function ReviewSheet({ initialReview, onSave }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const [rating, setRating] = useState<Rating | null>(initialReview?.rating ?? null);
  const [comment, setComment] = useState(initialReview?.comment ?? '');

  return (
    <View style={[styles.sheet, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('review_sheet_title')}</Text>
      <View style={styles.stars}>
        {RATINGS.map((star) => (
          <PressableScale
            key={star}
            scale={0.85}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={String(star)}
            onPress={() => {
              void Haptics.selectionAsync();
              setRating(star);
            }}
          >
            <Ionicons
              name={rating !== null && star <= rating ? 'star' : 'star-outline'}
              size={42}
              color={rating !== null && star <= rating ? colors.star : colors.textTertiary}
            />
          </PressableScale>
        ))}
      </View>
      <Text style={[styles.label, { color: colors.primary }]}>{rating ? ratingLabel(t, rating) : ' '}</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder={t('review_comment_hint')}
        placeholderTextColor={colors.textTertiary}
        multiline
        selectionColor={colors.primary}
        style={[styles.input, { backgroundColor: colors.surfaceRaised, color: colors.textPrimary }]}
      />
      <PressableScale
        onPress={() => rating && onSave(rating, comment)}
        disabled={!rating}
        accessibilityRole="button"
        style={{ opacity: rating ? 1 : 0.5 }}
      >
        <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.save}>
          <Text style={styles.saveLabel}>{t('review_save')}</Text>
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  title: { ...display(28), textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.bold, fontSize: 17, textAlign: 'center' },
  input: {
    minHeight: 96,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  save: { height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  saveLabel: { color: '#fff', fontFamily: fonts.bold, fontSize: 17 },
});
