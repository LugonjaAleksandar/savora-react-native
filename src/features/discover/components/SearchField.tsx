import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { cardShadow } from '@/core/components/primitives';
import { fonts, spacing, useColors } from '@/core/theme/theme';

export function SearchField({ value, onChangeText }: { value: string; onChangeText: (text: string) => void }) {
  const { t } = useTranslation();
  const colors = useColors();
  const [isFocused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.field,
        cardShadow(colors),
        { backgroundColor: colors.surface, borderColor: isFocused ? colors.primary + '99' : colors.stroke },
      ]}
    >
      <Ionicons name="search" size={20} color={colors.primary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('meals_search_hint')}
        placeholderTextColor={colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        autoCorrect={false}
        selectionColor={colors.primary}
        style={[styles.input, { color: colors.textPrimary }]}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityRole="button">
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md + 4,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 16, paddingVertical: 0 },
});
