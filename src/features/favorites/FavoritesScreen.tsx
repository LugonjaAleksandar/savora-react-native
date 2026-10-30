import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowBackground, StateMessage } from '@/core/components/primitives';
import { useFavorites } from '@/core/di/container';
import { display, fonts, radius, spacing, useColors } from '@/core/theme/theme';
import { MealSummary } from '@/features/meals/models';

import { FavoriteTile } from './components/FavoriteTile';

type Props = {
  onOpenMeal: (meal: MealSummary) => void;
  onRemoved: (meal: MealSummary, index: number) => void;
};

/** Saved tab. Opening a recipe and offering undo are reported to the route. */
export function FavoritesScreen({ onOpenMeal, onRemoved }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const favorites = useFavorites((store) => store.favorites);
  const remove = useFavorites((store) => store.remove);

  return (
    <GlowBackground>
      <Animated.FlatList
        data={favorites}
        keyExtractor={(meal) => meal.id}
        itemLayoutAnimation={LinearTransition.springify().damping(20)}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[display(38), { color: colors.textPrimary }]}>{t('favorites_title')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('favorites_subtitle', { count: favorites.length })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <StateMessage icon="heart" title={t('favorites_empty_title')} subtitle={t('favorites_empty_subtitle')} />
          </View>
        }
        renderItem={({ item }) => (
          <Animated.View exiting={FadeOut.duration(150)} style={styles.row}>
            <ReanimatedSwipeable
              friction={1.5}
              rightThreshold={80}
              overshootRight={false}
              renderRightActions={() => (
                <View style={[styles.removeAction, { backgroundColor: colors.danger }]}>
                  <Ionicons name="trash" size={24} color="#fff" />
                </View>
              )}
              onSwipeableOpen={() => {
                const index = remove(item.id);
                if (index !== null) {
                  onRemoved(item, index);
                }
              }}
            >
              <FavoriteTile meal={item} onPress={() => onOpenMeal(item)} />
            </ReanimatedSwipeable>
          </Animated.View>
        )}
      />
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBarClearance },
  header: { marginBottom: spacing.lg },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 17, marginTop: spacing.xs },
  empty: { marginTop: 96 },
  row: { marginBottom: spacing.md },
  removeAction: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.lg,
    marginLeft: -radius.lg,
  },
});
