import { StyleSheet, Text, View } from 'react-native';

import { RemoteImage } from '@/core/components/primitives';
import { fonts, radius, spacing, useColors } from '@/core/theme/theme';
import { Ingredient, ingredientImageUrl } from '@/features/meals/models';

/** One ingredient in the detail grid. */
export function IngredientTile({ ingredient }: { ingredient: Ingredient }) {
  const colors = useColors();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.stroke }]}>
      <View style={[styles.imageBox, { backgroundColor: colors.surfaceRaised }]}>
        <RemoteImage uri={ingredientImageUrl(ingredient)} contentFit="contain" style={styles.image} />
      </View>
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
          {ingredient.name}
        </Text>
        {ingredient.measure ? (
          <Text numberOfLines={1} style={[styles.measure, { color: colors.textSecondary }]}>
            {ingredient.measure}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  imageBox: { width: 52, height: 52, borderRadius: radius.sm, padding: 6 },
  image: { flex: 1, backgroundColor: 'transparent' },
  text: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 14 },
  measure: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
});
