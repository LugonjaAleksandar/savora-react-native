import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, PressableScale, RemoteImage } from '@/core/components/primitives';
import { fonts, radius, spacing, useColors } from '@/core/theme/theme';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { MealSummary, previewUrl } from '@/features/meals/models';

export const MEAL_CARD_ASPECT_RATIO = 0.74;

type Props = {
  meal: MealSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

/** Grid item. It only reports presses; the route decides where to navigate. */
export function MealCard({ meal, isFavorite, onPress, onToggleFavorite }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, cardShadow(colors)]}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={meal.name}
        containerStyle={styles.fill}
        style={styles.card}
      >
        <RemoteImage uri={previewUrl(meal)} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          locations={[0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Text numberOfLines={2} style={styles.title}>
          {meal.name}
        </Text>
      </PressableScale>
      <View style={styles.favorite}>
        <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, aspectRatio: MEAL_CARD_ASPECT_RATIO, borderRadius: radius.lg },
  fill: { flex: 1 },
  card: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  title: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, padding: spacing.md },
  favorite: { position: 'absolute', top: 10, right: 10 },
});
