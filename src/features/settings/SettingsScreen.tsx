import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { DerivedValue, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowBackground, IconName } from '@/core/components/primitives';
import { SlidingSelector } from '@/core/components/SlidingSelector';
import { useSettings } from '@/core/di/container';
import { display, fonts, radius, spacing, useColors } from '@/core/theme/theme';

import { AppLanguage, LANGUAGES, THEMES } from './settingsStore';

/** Language names stay in their own language, so they are findable whatever the current one is. */
const LANGUAGE_NAMES: Record<Exclude<AppLanguage, 'system'>, string> = { en: 'English', sr: 'Srpski' };

export function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const theme = useSettings((store) => store.theme);
  const language = useSettings((store) => store.language);
  const setTheme = useSettings((store) => store.setTheme);
  const setLanguage = useSettings((store) => store.setLanguage);

  return (
    <GlowBackground>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[display(38), { color: colors.textPrimary }]}>{t('settings_title')}</Text>

        <SettingsGroup title={t('settings_theme')} icon="color-palette">
          <SlidingSelector
            items={THEMES}
            selected={theme}
            onSelect={setTheme}
            height={46}
            renderItem={(item, selectedness) => (
              <OptionLabel label={t(`settings_theme_${item}`)} selectedness={selectedness} />
            )}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings_language')} icon="globe-outline">
          <SlidingSelector
            items={LANGUAGES}
            selected={language}
            onSelect={setLanguage}
            height={46}
            renderItem={(item, selectedness) => (
              <OptionLabel
                label={item === 'system' ? t('settings_language_system') : LANGUAGE_NAMES[item]}
                selectedness={selectedness}
              />
            )}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings_about')} icon="information-circle">
          <Text style={[styles.about, { color: colors.textSecondary }]}>{t('settings_about_body')}</Text>
        </SettingsGroup>
      </ScrollView>
    </GlowBackground>
  );
}

function SettingsGroup({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.stroke }]}>
      <View style={styles.groupHeader}>
        <Ionicons name={icon} size={20} color={colors.textPrimary} />
        <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function OptionLabel({ label, selectedness }: { label: string; selectedness: DerivedValue<number> }) {
  const colors = useColors();
  const style = useAnimatedStyle(() => ({
    color: interpolateColor(selectedness.value, [0, 1], [colors.textSecondary, '#FFFFFF']),
  }));
  return (
    <Animated.Text numberOfLines={1} style={[styles.option, style]}>
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBarClearance, gap: spacing.lg },
  group: { borderRadius: radius.lg, borderWidth: 1, padding: 20, gap: spacing.md },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupTitle: { fontFamily: fonts.bold, fontSize: 17 },
  about: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  option: { fontFamily: fonts.bold, fontSize: 14 },
});
