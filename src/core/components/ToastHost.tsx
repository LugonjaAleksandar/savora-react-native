import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeOutDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/core/di/container';
import { fonts, radius, spacing, useColors } from '@/core/theme/theme';

/** Renders the current toast above everything, including pushed screens and sheets. */
export function ToastHost() {
  const toast = useToast((state) => state.toast);
  const performAction = useToast((state) => state.performAction);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!toast) {
    return null;
  }
  return (
    <Animated.View
      key={toast.id}
      entering={SlideInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.toast, { backgroundColor: colors.textPrimary, bottom: insets.bottom + 88 }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.message, { color: colors.background }]}>{toast.message}</Text>
      {toast.actionLabel ? (
        <Pressable onPress={performAction} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.action, { color: colors.star }]}>{toast.actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: 14,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  message: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14 },
  action: { fontFamily: fonts.bold, fontSize: 14 },
});
