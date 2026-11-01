import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export type Palette = {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  onAccent: string;
  codeBackground: string;
};

export const LIGHT: Palette = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  text: '#101828',
  mutedText: '#55606E',
  border: '#D9DEE5',
  accent: '#1565C0',
  onAccent: '#FFFFFF',
  codeBackground: '#E9EDF2',
};

export const DARK: Palette = {
  background: '#0E1116',
  surface: '#1A1F27',
  text: '#F2F4F7',
  mutedText: '#A3ADBA',
  border: '#303844',
  accent: '#64B5F6',
  onAccent: '#0E1116',
  codeBackground: '#262D37',
};

const ThemeOverrideContext = createContext<Palette | null>(null);

/** Forces a palette on a subtree, for screens with their own background. */
export const ThemeOverride = ThemeOverrideContext.Provider;

export function useTheme(): Palette {
  const override = useContext(ThemeOverrideContext);
  const scheme = useColorScheme();
  return override ?? (scheme === 'dark' ? DARK : LIGHT);
}
