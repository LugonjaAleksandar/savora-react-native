import { Ionicons } from '@expo/vector-icons';
import { Image, ImageContentFit } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps, ReactNode, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { brandGradient, Colors, fonts, spacing, useColors } from '@/core/theme/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Soft warm glows behind every tab, matching the Flutter `GlowBackground`. */
export function GlowBackground({ children }: { children: ReactNode }) {
  const colors = useColors();
  // Full-screen gradients rather than blurred circles: the same warmth, with no visible edges.
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.glowWarm, 'transparent']}
        locations={[0, 0.55]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', colors.glowCool]}
        locations={[0.4, 1]}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 1, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/** Pressable that scales down slightly while pressed, used by every tappable card. */
export function PressableScale({
  scale = 0.96,
  style,
  containerStyle,
  children,
  ...props
}: PressableProps & {
  scale?: number;
  style?: StyleProp<ViewStyle>;
  /** Layout for the touch target itself, e.g. `flex: 1` when the content should fill its parent. */
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scale]) }],
  }));
  return (
    <Pressable
      {...props}
      style={containerStyle}
      onPressIn={(event) => {
        pressed.set(withSpring(1, { damping: 18, stiffness: 400 }));
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(withSpring(0, { damping: 14, stiffness: 300 }));
        props.onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children as ReactNode}</Animated.View>
    </Pressable>
  );
}

export function GradientButton({
  label,
  icon,
  onPress,
  isLoading = false,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  isLoading?: boolean;
}) {
  return (
    <PressableScale onPress={isLoading ? undefined : onPress} accessibilityRole="button" style={styles.gradientShadow}>
      <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
        {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name={icon} size={18} color="#fff" />}
        <Text style={styles.gradientLabel}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

export function RatingStars({ rating, size = 18 }: { rating: number; size?: number }) {
  const colors = useColors();
  return (
    <View style={styles.row} accessibilityLabel={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? colors.star : colors.textTertiary}
        />
      ))}
    </View>
  );
}

export function StateMessage({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.stateMessage}>
      <LinearGradient colors={brandGradient} style={styles.stateIcon}>
        <Ionicons name={icon} size={34} color="#fff" />
      </LinearGradient>
      <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? <GradientButton label={actionLabel} icon="refresh" onPress={onAction} /> : null}
    </View>
  );
}

/** expo-image with memory + disk caching, a warm placeholder and a short crossfade. */
export function RemoteImage({
  uri,
  style,
  contentFit = 'cover',
}: {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
}) {
  const colors = useColors();
  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.surfaceRaised }, style as object]}
      contentFit={contentFit}
      transition={250}
    />
  );
}

/** Placeholder block with a sweeping highlight, used for skeletons. */
export function Shimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1));
  }, [progress]);
  const highlight = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-300, 400]) }],
  }));
  return (
    <View style={[{ backgroundColor: colors.surfaceRaised, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, highlight]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerBand}
        />
      </Animated.View>
    </View>
  );
}

export function SectionTitle({ title, trailing }: { title: string; trailing?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>{title}</Text>
      {trailing ? <Text style={[styles.sectionTrailing, { color: colors.textTertiary }]}>{trailing}</Text> : null}
    </View>
  );
}

export const cardShadow = (colors: Colors): ViewStyle => ({
  shadowColor: colors.shadow,
  shadowOpacity: 0.14,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
});

const styles = StyleSheet.create({
  gradientShadow: {
    shadowColor: '#FF5A47',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderRadius: 999,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  gradientLabel: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
  row: { flexDirection: 'row', gap: 2 },
  stateMessage: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  stateIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontFamily: fonts.bold, fontSize: 20, textAlign: 'center' },
  stateSubtitle: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  shimmerBand: { width: 220, height: '100%' },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleText: { fontFamily: fonts.display, fontSize: 24 },
  sectionTrailing: { fontFamily: fonts.bold, fontSize: 14 },
});
