import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { PressableScale, RemoteImage } from '@/core/components/primitives';
import { fonts, useColors } from '@/core/theme/theme';
import { MealCategory } from '@/features/meals/models';

type Props = {
  category: MealCategory;
  isSelected: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

/**
 * One category in `CategoryChips`. Transparent while selected, because the
 * sliding pill behind it provides the fill; it only reports presses.
 */
export function CategoryChip({ category, isSelected, onPress, onLayout }: Props) {
  const colors = useColors();
  const selected = useDerivedValue(() => withTiming(isSelected ? 1 : 0, { duration: 250 }));
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(selected.value, [0, 1], [colors.surface, 'rgba(255,255,255,0)']),
    borderColor: interpolateColor(selected.value, [0, 1], [colors.stroke, 'rgba(255,255,255,0)']),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(selected.value, [0, 1], [colors.surfaceRaised, 'rgba(255,255,255,0.25)']),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(selected.value, [0, 1], [colors.textPrimary, '#FFFFFF']),
  }));

  return (
    <PressableScale
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View style={[styles.chip, chipStyle]}>
        <Animated.View style={[styles.icon, iconStyle]}>
          <RemoteImage uri={category.thumbnailUrl} contentFit="contain" style={styles.image} />
        </Animated.View>
        <Animated.Text style={[styles.label, labelStyle]}>{category.name}</Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
    paddingRight: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  icon: { width: 44, height: 44, borderRadius: 22, padding: 5 },
  image: { flex: 1, backgroundColor: 'transparent' },
  label: { fontFamily: fonts.bold, fontSize: 15 },
});
