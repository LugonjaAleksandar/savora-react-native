import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { GradientButton } from '@/core/components/primitives';
import { brandGradient, display, fonts, spacing, useColors } from '@/core/theme/theme';

function greetingKey(hour = new Date().getHours()) {
  if (hour < 12) {
    return 'greeting_morning';
  }
  return hour < 18 ? 'greeting_afternoon' : 'greeting_evening';
}

export function DiscoverHeader({
  isFetchingRandomMeal,
  onSurpriseMe,
}: {
  isFetchingRandomMeal: boolean;
  onSurpriseMe: () => void;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{t(greetingKey())}</Text>
        <GradientButton
          label={t('meals_surprise_me')}
          icon="dice"
          onPress={onSurpriseMe}
          isLoading={isFetchingRandomMeal}
        />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('meals_header_title_prefix')} <Text style={styles.highlight}>{t('meals_header_title_highlight')}</Text>
        {t('meals_header_title_suffix')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: fonts.semiBold, fontSize: 17 },
  title: { ...display(38), marginTop: spacing.md },
  // A gradient cannot be applied to a run inside Text, so the highlight uses the gradient's start color.
  highlight: { fontFamily: fonts.displayItalic, color: brandGradient[0] },
});
