import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { PressableScale } from '@/core/components/primitives';
import { useColors } from '@/core/theme/theme';

/** Glass heart toggle shared by the grid card and the detail screen. */
export function FavoriteButton({ isFavorite, onToggle }: { isFavorite: boolean; onToggle: () => void }) {
  const colors = useColors();
  return (
    <PressableScale
      scale={0.88}
      onPress={() => {
        void Haptics.selectionAsync();
        onToggle();
      }}
      style={styles.button}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      hitSlop={8}
    >
      <Animated.View key={String(isFavorite)} entering={ZoomIn.springify().damping(9)}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? colors.primary : '#FFFFFF'}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
});
