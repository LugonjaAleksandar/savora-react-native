import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconName, SectionTitle } from '@/core/components/primitives';
import { brandGradient, display, fonts, spacing, useColors } from '@/core/theme/theme';
import { isHttpUrl, MealDetail, mealSteps } from '@/features/meals/models';
import { ReviewSection } from '@/features/reviews/ReviewSection';
import { MealReview } from '@/features/reviews/reviewsStore';

import { IngredientTile } from './IngredientTile';

type Props = {
  meal: MealDetail;
  review: MealReview | undefined;
  onWriteReview: () => void;
  onDeleteReview: () => void;
  onOpenLink: (url: string) => void;
};

/** The loaded recipe. Links and the review sheet are reported upwards to the route. */
export function MealDetailContent({ meal, review, onWriteReview, onDeleteReview, onOpenLink }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const steps = mealSteps(meal);
  const rows = [];
  for (let index = 0; index < meal.ingredients.length; index += 2) {
    rows.push(meal.ingredients.slice(index, index + 2));
  }

  return (
    <View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{meal.name}</Text>
      <View style={styles.chips}>
        {meal.category ? <MetaChip icon="restaurant" label={meal.category} /> : null}
        {meal.area ? <MetaChip icon="globe-outline" label={meal.area} /> : null}
        <MetaChip icon="basket" label={t('detail_ingredients_count', { count: meal.ingredients.length })} />
        {meal.tags.map((tag) => (
          <MetaChip key={tag} icon="pricetag" label={tag} />
        ))}
      </View>

      <ReviewSection review={review} onWrite={onWriteReview} onDelete={onDeleteReview} />

      <View style={styles.section}>
        <SectionTitle title={t('detail_ingredients')} trailing={String(meal.ingredients.length)} />
        <View style={styles.grid}>
          {rows.map((row, index) => (
            <View key={index} style={styles.gridRow}>
              {row.map((ingredient) => (
                <IngredientTile key={ingredient.name} ingredient={ingredient} />
              ))}
              {row.length === 1 ? <View style={styles.flex} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('detail_instructions')} />
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={styles.timeline}>
              <LinearGradient colors={brandGradient} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </LinearGradient>
              {index < steps.length - 1 ? (
                <LinearGradient colors={[colors.primary + '80', colors.stroke]} style={styles.line} />
              ) : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepLabel, { color: colors.primary }]}>
                {t('detail_step', { number: index + 1 })}
              </Text>
              <Text style={[styles.stepText, { color: colors.textPrimary }]}>{step}</Text>
            </View>
          </View>
        ))}
      </View>

      {isHttpUrl(meal.youtubeUrl) || isHttpUrl(meal.sourceUrl) ? (
        <View style={styles.links}>
          {isHttpUrl(meal.youtubeUrl) ? (
            <LinkButton
              icon="logo-youtube"
              label={t('detail_watch_video')}
              filled
              onPress={() => onOpenLink(meal.youtubeUrl!)}
            />
          ) : null}
          {isHttpUrl(meal.sourceUrl) ? (
            <LinkButton icon="open-outline" label={t('detail_source')} onPress={() => onOpenLink(meal.sourceUrl!)} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function MetaChip({ icon, label }: { icon: IconName; label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.metaChip, { backgroundColor: colors.surfaceRaised }]}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>{label}</Text>
    </View>
  );
}

function LinkButton({
  icon,
  label,
  filled = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  filled?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={[styles.linkButton, filled ? styles.youtube : { borderColor: colors.stroke, borderWidth: 1.5 }]}
    >
      <Ionicons name={icon} size={18} color={filled ? '#fff' : colors.primary} />
      <Text numberOfLines={1} style={[styles.linkLabel, { color: filled ? '#fff' : colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: display(30),
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metaLabel: { fontFamily: fonts.semiBold, fontSize: 13 },
  section: { marginTop: spacing.xl },
  grid: { gap: spacing.sm },
  gridRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  step: { flexDirection: 'row', gap: spacing.md },
  timeline: { alignItems: 'center' },
  stepNumber: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
  line: { width: 2, flex: 1, borderRadius: 1, marginVertical: spacing.xs },
  stepBody: { flex: 1, paddingTop: 6, paddingBottom: spacing.lg },
  stepLabel: { fontFamily: fonts.extraBold, fontSize: 12 },
  stepText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, marginTop: spacing.xs },
  links: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  linkButton: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  youtube: { backgroundColor: '#FF0033' },
  linkLabel: { fontFamily: fonts.bold, fontSize: 14 },
});
