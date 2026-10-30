import { useColorScheme } from 'react-native';

/** Savora design tokens, the same palette as the Flutter, iOS and Android apps. */
const light = {
  background: '#FFF7F2',
  surface: '#FFFFFF',
  surfaceRaised: '#FFEEE5',
  stroke: '#F1DED4',
  textPrimary: '#22141F',
  textSecondary: '#6E5A66',
  textTertiary: '#A8949E',
  primary: '#FF5A47',
  star: '#FFB13D',
  danger: '#E5484D',
  shadow: '#7A2E1F',
  glowWarm: 'rgba(255, 177, 61, 0.22)',
  glowCool: 'rgba(255, 77, 109, 0.16)',
};

const dark: typeof light = {
  background: '#130E17',
  surface: '#1E1724',
  surfaceRaised: '#2A2131',
  stroke: '#332A3A',
  textPrimary: '#FBF3EE',
  textSecondary: '#BBAAB6',
  textTertiary: '#7D6D79',
  primary: '#FF6B57',
  star: '#FFC15C',
  danger: '#FF6369',
  shadow: '#000000',
  glowWarm: 'rgba(255, 138, 61, 0.16)',
  glowCool: 'rgba(155, 92, 255, 0.18)',
};

export type Colors = typeof light;

export const brandGradient = ['#FF8A3D', '#FF4D6D'] as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, tabBarClearance: 120 } as const;

export const radius = { sm: 12, md: 20, lg: 28 } as const;

/** Fraunces for display type and Plus Jakarta Sans for everything else, as in the Flutter app. */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Colors follow the color scheme, which the root layout overrides from Settings. */
export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const display = (size: number) => ({ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.12 });
