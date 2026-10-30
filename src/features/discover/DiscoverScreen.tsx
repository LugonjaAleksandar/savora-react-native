import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowBackground, Shimmer, StateMessage } from '@/core/components/primitives';
import { useContainer, useFavorites } from '@/core/di/container';
import { failureMessage } from '@/core/i18n/i18n';
import { display, fonts, radius, spacing, useColors } from '@/core/theme/theme';
import { MealSummary } from '@/features/meals/models';

import { CategoryChips } from './components/CategoryChips';
import { DiscoverHeader } from './components/DiscoverHeader';
import { MEAL_CARD_ASPECT_RATIO, MealCard } from './components/MealCard';
import { SearchField } from './components/SearchField';
import { DiscoverState, useDiscover } from './useDiscover';

type Props = {
  onOpenMeal: (meal: MealSummary) => void;
  onRandomMealFailed: (message: string) => void;
};

/** Discover tab. Navigation is reported through callbacks; the route performs it. */
export function DiscoverScreen({ onOpenMeal, onRandomMealFailed }: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mealsRepository } = useContainer();
  const { state, selectCategory, search, refresh, randomMeal } = useDiscover(mealsRepository);
  const favorites = useFavorites((store) => store.favorites);
  const toggleFavorite = useFavorites((store) => store.toggle);
  const [searchText, setSearchText] = useState('');

  const surpriseMe = async () => {
    const result = await randomMeal();
    if (result.ok) {
      onOpenMeal(result.data);
    } else {
      onRandomMealFailed(failureMessage(t, result.failure));
    }
  };

  const resultKey = `${state.selectedCategory?.id}-${state.query}`;
  const isLoaded = state.status.kind === 'loaded';
  const meals: (MealSummary | null)[] = isLoaded
    ? state.meals
    : state.status.kind === 'loading'
      ? Array(6).fill(null)
      : [];

  return (
    <GlowBackground>
      <FlatList
        data={meals}
        numColumns={2}
        // Items are keyed per result set, so the staggered entrance replays on every category or
        // query, while the header (chips and search) keeps its state.
        keyExtractor={(meal, index) => (meal ? `${resultKey}-${meal.id}` : `placeholder-${index}`)}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: spacing.tabBarClearance }}
        columnWrapperStyle={styles.columns}
        refreshControl={
          <RefreshControl refreshing={state.isRefreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            <DiscoverHeader isFetchingRandomMeal={state.isFetchingRandomMeal} onSurpriseMe={surpriseMe} />
            <View style={styles.searchRow}>
              <SearchField
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  void search(text);
                }}
              />
            </View>
            <CategoryChips
              categories={state.categories}
              selected={state.selectedCategory}
              isDimmed={state.query.length > 0}
              onSelect={(category) => {
                setSearchText('');
                Keyboard.dismiss();
                void selectCategory(category);
              }}
            />
            <SectionHeader state={state} />
          </>
        }
        ListEmptyComponent={<EmptyOrFailure state={state} onRetry={refresh} />}
        renderItem={({ item, index }) =>
          item ? (
            <Animated.View
              entering={FadeInDown.delay((index % 8) * 50)
                .springify()
                .damping(18)}
              style={styles.cell}
            >
              <MealCard
                meal={item}
                isFavorite={favorites.some((favorite) => favorite.id === item.id)}
                onPress={() => onOpenMeal(item)}
                onToggleFavorite={() => toggleFavorite(item)}
              />
            </Animated.View>
          ) : (
            <View style={styles.cell}>
              <Shimmer style={styles.placeholder} />
            </View>
          )
        }
      />
    </GlowBackground>
  );
}

function SectionHeader({ state }: { state: DiscoverState }) {
  const { t } = useTranslation();
  const colors = useColors();
  const title = state.query
    ? t('meals_section_search', { query: state.query })
    : state.selectedCategory
      ? t('meals_section_category', { category: state.selectedCategory.name })
      : '';
  return (
    <View style={styles.sectionHeader}>
      <Text numberOfLines={1} style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {state.status.kind === 'loaded' ? (
        <Text style={[styles.count, { color: colors.primary, backgroundColor: colors.primary + '1A' }]}>
          {t('meals_count', { count: state.meals.length })}
        </Text>
      ) : null}
    </View>
  );
}

function EmptyOrFailure({ state, onRetry }: { state: DiscoverState; onRetry: () => void }) {
  const { t } = useTranslation();
  if (state.status.kind === 'failed') {
    return (
      <StateMessage
        icon="cloud-offline"
        title={failureMessage(t, state.status.failure)}
        actionLabel={t('action_retry')}
        onAction={onRetry}
      />
    );
  }
  if (state.status.kind === 'loaded') {
    return <StateMessage icon="fast-food" title={t('meals_empty_title')} subtitle={t('meals_empty_subtitle')} />;
  }
  return null;
}

const styles = StyleSheet.create({
  searchRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  columns: { gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  cell: { flex: 1 },
  placeholder: { aspectRatio: MEAL_CARD_ASPECT_RATIO, borderRadius: radius.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...display(24), flex: 1 },
  count: {
    fontFamily: fonts.bold,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
