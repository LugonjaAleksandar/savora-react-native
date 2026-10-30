import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Animated, { DerivedValue, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconName } from '@/core/components/primitives';
import { SlidingSelector } from '@/core/components/SlidingSelector';
import { fonts, spacing, useColors } from '@/core/theme/theme';

const TABS: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: 'nav_discover', icon: 'compass-outline', activeIcon: 'compass' },
  favorites: { label: 'nav_favorites', icon: 'heart-outline', activeIcon: 'heart' },
  settings: { label: 'nav_settings', icon: 'options-outline', activeIcon: 'options' },
};

/** Floating glass tab bar with a gradient pill that slides and stretches between tabs. */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const routes = state.routes.map((route) => route.name);
  const selected = routes[state.index] ?? 'index';

  return (
    <View style={[styles.container, { bottom: insets.bottom + spacing.xs }]}>
      <BlurView intensity={60} tint={scheme === 'dark' ? 'dark' : 'light'} style={styles.glass}>
        <SlidingSelector
          items={routes}
          selected={selected}
          expandSelected
          height={56}
          onSelect={(name) => {
            const route = state.routes.find((item) => item.name === name);
            if (route && name !== selected) {
              navigation.navigate(route.name, route.params);
            }
          }}
          renderItem={(name, selectedness) => (
            <TabItem name={name} isSelected={name === selected} selectedness={selectedness} />
          )}
        />
      </BlurView>
    </View>
  );
}

function TabItem({
  name,
  isSelected,
  selectedness,
}: {
  name: string;
  isSelected: boolean;
  selectedness: DerivedValue<number>;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const tab = TABS[name];
  const labelStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, (selectedness.value - 0.5) * 2),
    color: interpolateColor(selectedness.value, [0, 1], [colors.textSecondary, '#FFFFFF']),
  }));
  if (!tab) {
    return null;
  }
  return (
    <View style={styles.item} accessibilityLabel={t(tab.label)}>
      <Ionicons
        name={isSelected ? tab.activeIcon : tab.icon}
        size={21}
        color={isSelected ? '#FFFFFF' : colors.textSecondary}
      />
      {isSelected ? (
        <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {t(tab.label)}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 999,
    shadowColor: '#7A2E1F',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  glass: {
    borderRadius: 999,
    overflow: 'hidden',
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.bold, fontSize: 14 },
});
