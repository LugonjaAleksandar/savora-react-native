import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  DerivedValue,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { brandGradient } from '@/core/theme/theme';

type Props<T> = {
  items: readonly T[];
  selected: T;
  onSelect: (item: T) => void;
  /** The selected segment grows to twice the width of the others, interpolated with the thumb. */
  expandSelected?: boolean;
  height: number;
  renderItem: (item: T, selectedness: DerivedValue<number>, index: number) => ReactNode;
  accessibilityLabel?: (item: T) => string;
};

/**
 * Segmented control with one gradient thumb that slides between items. The
 * position animates as a fraction on the UI thread, and every segment derives
 * its width and `selectedness` from it, so labels morph in step with the slide.
 */
export function SlidingSelector<T>({
  items,
  selected,
  onSelect,
  expandSelected = false,
  height,
  renderItem,
  accessibilityLabel,
}: Props<T>) {
  const [width, setWidth] = useState(0);
  const position = useSharedValue(Math.max(items.indexOf(selected), 0));

  useEffect(() => {
    position.set(withTiming(Math.max(items.indexOf(selected), 0), { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [items, position, selected]);

  const extra = expandSelected ? 1 : 0;
  const count = items.length;

  const thumbStyle = useAnimatedStyle(() => {
    const unit = width / (count + extra);
    const widthAt = (index: number) => unit * (1 + Math.max(0, 1 - Math.abs(index - position.value)) * extra);
    let left = 0;
    const from = Math.min(Math.floor(position.value), count - 1);
    for (let i = 0; i < from; i++) {
      left += widthAt(i);
    }
    const fraction = position.value - from;
    const thumbWidth = widthAt(from) + (from + 1 < count ? (widthAt(from + 1) - widthAt(from)) * fraction : 0);
    return { left: left + widthAt(from) * fraction, width: thumbWidth };
  });

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View style={[styles.thumb, thumbStyle]}>
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {items.map((item, index) => (
        <Segment
          key={String(item)}
          index={index}
          position={position}
          unitWidth={width / (count + extra)}
          extra={extra}
          count={count}
        >
          <Pressable
            style={styles.segmentPressable}
            onPress={() => onSelect(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: item === selected }}
            accessibilityLabel={accessibilityLabel?.(item)}
          >
            <SelectednessScope index={index} position={position}>
              {(selectedness) => renderItem(item, selectedness, index)}
            </SelectednessScope>
          </Pressable>
        </Segment>
      ))}
    </View>
  );
}

function Segment({
  index,
  position,
  unitWidth,
  extra,
  count,
  children,
}: {
  index: number;
  position: SharedValue<number>;
  unitWidth: number;
  extra: number;
  count: number;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const widthAt = (i: number) => unitWidth * (1 + Math.max(0, 1 - Math.abs(i - position.value)) * extra);
    let left = 0;
    for (let i = 0; i < index && i < count; i++) {
      left += widthAt(i);
    }
    return { left, width: widthAt(index) };
  });
  return <Animated.View style={[styles.segment, style]}>{children}</Animated.View>;
}

function SelectednessScope({
  index,
  position,
  children,
}: {
  index: number;
  position: SharedValue<number>;
  children: (selectedness: DerivedValue<number>) => ReactNode;
}) {
  const selectedness = useDerivedValue(() => Math.max(0, 1 - Math.abs(index - position.value)));
  return <>{children(selectedness)}</>;
}

const styles = StyleSheet.create({
  thumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF5A47',
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  segment: { position: 'absolute', top: 0, bottom: 0, overflow: 'hidden' },
  segmentPressable: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
