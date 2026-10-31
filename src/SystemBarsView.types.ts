import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from 'react-native';

export type { EdgeInsets, WindowInsets } from './NativeWindowSystemBars';

/**
 * `dark-content` means dark icons, `light-content` means light icons, `auto`
 * picks whichever is readable on the bar's color.
 */
export type SystemBarStyle = 'auto' | 'dark-content' | 'light-content';

export type SystemBarsViewProps = Omit<ViewProps, 'style' | 'children'> & {
  children?: ReactNode;
  /** Applied to the view holding `children`. */
  style?: StyleProp<ViewStyle>;
  /** Color of the status bar. Ignored while `fullScreen` is on. */
  statusBarColor?: ColorValue;
  /** Color of the navigation bar. */
  navigationBarColor?: ColorValue;
  /**
   * Lets content draw behind the status bar and the display cutout. The status
   * bar stays visible, and content still stops at the navigation bar.
   *
   * @default false
   */
  fullScreen?: boolean;
  /** @default 'auto' */
  statusBarStyle?: SystemBarStyle;
  /** @default 'auto' */
  navigationBarStyle?: SystemBarStyle;
};
