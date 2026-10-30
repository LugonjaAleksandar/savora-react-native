import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { brandGradient, spacing } from '@/core/theme/theme';
import { MealCategory } from '@/features/meals/models';

import { CategoryChip } from './CategoryChip';

type Layout = { x: number; width: number };

type Props = {
  categories: MealCategory[];
  selected: MealCategory | null;
  isDimmed: boolean;
  onSelect: (category: MealCategory) => void;
};

const PILL_SPRING = { damping: 17, stiffness: 160, mass: 0.9 };

/**
 * Horizontal category picker. The gradient pill is a single view that springs
 * between chips, so only the selector moves while the chips never shift.
 */
export function CategoryChips({ categories, selected, isDimmed, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const { width: viewport } = useWindowDimensions();
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const opacity = useSharedValue(1);
  const target = selected ? layouts[selected.id] : undefined;

  useEffect(() => {
    if (!target) {
      return;
    }
    const isFirstPlacement = pillWidth.get() === 0;
    pillX.set(isFirstPlacement ? target.x : withSpring(target.x, PILL_SPRING));
    pillWidth.set(isFirstPlacement ? target.width : withSpring(target.width, PILL_SPRING));
    // Scroll only when the chip is cut off, so a tap never moves what is already visible.
    if (target.x < scrollX.current || target.x + target.width > scrollX.current + viewport) {
      scrollRef.current?.scrollTo({ x: Math.max(0, target.x + target.width / 2 - viewport / 2), animated: true });
    }
  }, [pillWidth, pillX, target, viewport]);

  useEffect(() => {
    opacity.set(withTiming(isDimmed ? 0.55 : 1, { duration: 200 }));
  }, [isDimmed, opacity]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pillX.value }], width: pillWidth.value }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={containerStyle}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.current = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
      >
        <View style={styles.row}>
          {target && !isDimmed ? (
            <Animated.View style={[styles.pill, pillStyle]}>
              <LinearGradient
                colors={brandGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          ) : null}
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isSelected={category.id === selected?.id && !isDimmed}
              onPress={() => onSelect(category)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                setLayouts((current) => ({ ...current, [category.id]: { x, width } }));
              }}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Vertical room for the selected chip's shadow, so the scroll view does not clip it.
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  row: { flexDirection: 'row', gap: 12 },
  pill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF5A47',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
