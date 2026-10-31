import { StyleSheet, View } from 'react-native';
import type { SystemBarsViewProps, WindowInsets } from './SystemBarsView.types';

const ZERO = { top: 0, right: 0, bottom: 0, left: 0 };
const ZERO_INSETS: WindowInsets = {
  statusBar: ZERO,
  navigationBar: ZERO,
  displayCutout: ZERO,
};

/**
 * Android only for now. Elsewhere it lays out its children and does not touch
 * the system bars.
 */
export function SystemBarsView({
  children,
  style,
  statusBarColor: _statusBarColor,
  navigationBarColor: _navigationBarColor,
  fullScreen: _fullScreen,
  statusBarStyle: _statusBarStyle,
  navigationBarStyle: _navigationBarStyle,
  ...rest
}: SystemBarsViewProps) {
  return (
    <View {...rest} style={[styles.root, style]}>
      {children}
    </View>
  );
}

export function useWindowInsets(): WindowInsets {
  return ZERO_INSETS;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
