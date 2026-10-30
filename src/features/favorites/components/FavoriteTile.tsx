import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { cardShadow, PressableScale, RemoteImage } from '@/core/components/primitives';
import { fonts, radius, spacing, useColors } from '@/core/theme/theme';
import { MealSummary, previewUrl } from '@/features/meals/models';

/** One saved recipe. It only reports presses; the route navigates. */
export function FavoriteTile({ meal, onPress }: { meal: MealSummary; onPress: () => void }) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meal.name}
      style={[styles.tile, cardShadow(colors), { backgroundColor: colors.surface }]}
    >
      <RemoteImage uri={previewUrl(meal)} style={styles.image} />
      <Text numberOfLines={2} style={[styles.name, { color: colors.textPrimary }]}>
        {meal.name}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.lg,
  },
  image: { width: 84, height: 84, borderRadius: radius.md },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 16 },
});
