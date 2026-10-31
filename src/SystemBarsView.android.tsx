import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  processColor,
  useColorScheme,
  type ColorValue,
  type EventSubscription,
  type ViewStyle,
} from 'react-native';
import NativeWindowSystemBars from './NativeWindowSystemBars';
import SystemBarsAnchor from './SystemBarsAnchorNativeComponent';
import type {
  EdgeInsets,
  SystemBarStyle,
  SystemBarsViewProps,
  WindowInsets,
} from './SystemBarsView.types';

// Android 8.0 added dark navigation bar icons. Before it they are always light.
const SUPPORTS_DARK_NAVIGATION_ICONS = Number(Platform.Version) >= 26;

const ZERO_EDGES: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Keeps one native subscription, however many wrappers are mounted. */
function createNativeStore<T>(
  read: () => T,
  listen: (onChange: (value: T) => void) => EventSubscription
) {
  let value: T | undefined;
  let subscription: EventSubscription | null = null;
  const listeners = new Set<() => void>();

  const update = (next: T) => {
    value = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot(): T {
      return (value ??= read());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (subscription === null) {
        subscription = listen(update);
        // Events are missed while nothing is subscribed.
        const latest = read();
        if (JSON.stringify(latest) !== JSON.stringify(value)) {
          update(latest);
        }
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          subscription?.remove();
          subscription = null;
        }
      };
    },
  };
}

const insetsStore = createNativeStore(
  () => NativeWindowSystemBars.getInsets(),
  (onChange) => NativeWindowSystemBars.onInsetsChange(onChange)
);

const activeBarsStore = createNativeStore(
  () => NativeWindowSystemBars.getActiveBars(),
  (onChange) => NativeWindowSystemBars.onActiveBarsChange(onChange)
);

let nextBarsId = 1;

/** What the bars should look like while a given wrapper is in charge. */
type BarsConfig = {
  topColor: ColorValue | undefined;
  bottomColor: ColorValue | undefined;
  fullScreen: boolean;
  darkNavigationIcons: boolean;
};

type ParentBars = {
  /** Hands a nested wrapper's config to the wrapper drawing the bars. */
  report: (barsId: number, config: BarsConfig) => () => void;
  statusBarColor: ColorValue | undefined;
  navigationBarColor: ColorValue | undefined;
  fullScreen: boolean | undefined;
};

const ParentBarsContext = createContext<ParentBars | null>(null);

/* eslint-disable no-bitwise -- unpacking an ARGB integer */
function colorLuminance(color: ColorValue | undefined): number | null {
  const argb = color === undefined ? null : processColor(color);
  // Dynamic colors (PlatformColor) are not numbers and cannot be inspected.
  if (typeof argb !== 'number' || argb >>> 24 === 0) {
    return null;
  }
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
/* eslint-enable no-bitwise */

function usesDarkIcons(
  style: SystemBarStyle,
  color: ColorValue | undefined,
  isDarkTheme: boolean
): boolean {
  if (style !== 'auto') {
    return style === 'dark-content';
  }
  const luminance = colorLuminance(color);
  return luminance === null ? !isDarkTheme : luminance > 0.5;
}

function maxEdges(a: EdgeInsets, b: EdgeInsets): EdgeInsets {
  return {
    top: Math.max(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
    left: Math.max(a.left, b.left),
  };
}

export function useWindowInsets(): WindowInsets {
  return useSyncExternalStore(insetsStore.subscribe, insetsStore.getSnapshot);
}

export function SystemBarsView({
  children,
  style,
  statusBarColor: statusBarColorProp,
  navigationBarColor: navigationBarColorProp,
  fullScreen: fullScreenProp,
  statusBarStyle = 'auto',
  navigationBarStyle = 'auto',
  ...rest
}: SystemBarsViewProps) {
  const insets = useWindowInsets();
  const activeBars = useSyncExternalStore(
    activeBarsStore.subscribe,
    activeBarsStore.getSnapshot
  );
  const isDarkTheme = useColorScheme() === 'dark';
  const [barsId] = useState(() => nextBarsId++);

  // The outermost wrapper in a window draws the bars and holds the padding. It
  // sits above anything that shares the screen with a nested wrapper, like a
  // tab bar, so the padding lands below that too. A nested wrapper only says
  // what it wants, and leaves out whatever it inherits.
  const parent = useContext(ParentBarsContext);
  const isNested =
    parent !== null && !activeBars.foreignBarsIds.includes(barsId);

  const statusBarColor = statusBarColorProp ?? parent?.statusBarColor;
  const navigationBarColor =
    navigationBarColorProp ?? parent?.navigationBarColor;
  const fullScreen = fullScreenProp ?? parent?.fullScreen;

  const contentBackground = StyleSheet.flatten(style)?.backgroundColor;
  const topColor = statusBarColor ?? contentBackground;
  const bottomColor = navigationBarColor ?? contentBackground;

  const darkStatusBarIcons = usesDarkIcons(
    statusBarStyle,
    topColor,
    isDarkTheme
  );
  const darkNavigationIcons = usesDarkIcons(
    navigationBarStyle,
    bottomColor,
    isDarkTheme
  );

  const config = useMemo<BarsConfig>(
    () => ({
      topColor,
      bottomColor,
      fullScreen: fullScreen ?? false,
      darkNavigationIcons,
    }),
    [topColor, bottomColor, fullScreen, darkNavigationIcons]
  );

  const [nestedConfigs, setNestedConfigs] = useState<
    ReadonlyMap<number, BarsConfig>
  >(new Map());

  const reportNested = useCallback<ParentBars['report']>(
    (nestedId, nestedConfig) => {
      setNestedConfigs((configs) =>
        new Map(configs).set(nestedId, nestedConfig)
      );
      return () => {
        setNestedConfigs((configs) => {
          const next = new Map(configs);
          next.delete(nestedId);
          return next;
        });
      };
    },
    []
  );

  const report = isNested ? parent.report : null;
  useLayoutEffect(() => report?.(barsId, config), [report, barsId, config]);

  const parentForChildren = useMemo<ParentBars>(
    () => ({
      report: report ?? reportNested,
      statusBarColor,
      navigationBarColor,
      fullScreen,
    }),
    [report, reportNested, statusBarColor, navigationBarColor, fullScreen]
  );

  const shown = nestedConfigs.get(activeBars.barsId) ?? config;

  // The status bar and the cutout only keep content out when not full screen.
  // The navigation bar always does, and it sits on the left or the right of
  // some landscape phones.
  const top = shown.fullScreen
    ? ZERO_EDGES
    : maxEdges(insets.statusBar, insets.displayCutout);
  const edges = isNested ? ZERO_EDGES : maxEdges(top, insets.navigationBar);

  // Light icons on a light bar would disappear, so dim the bar behind them.
  const needsNavigationScrim =
    !SUPPORTS_DARK_NAVIGATION_ICONS && shown.darkNavigationIcons;

  return (
    <ParentBarsContext.Provider value={parentForChildren}>
      <View
        {...rest}
        style={[
          styles.root,
          {
            paddingTop: edges.top,
            paddingRight: edges.right,
            paddingBottom: edges.bottom,
            paddingLeft: edges.left,
          },
        ]}
      >
        <SystemBarsAnchor
          style={styles.anchor}
          barsId={barsId}
          darkStatusBarIcons={darkStatusBarIcons}
          darkNavigationBarIcons={darkNavigationIcons}
        />
        <View style={[styles.content, style]}>{children}</View>
        {!isNested && (
          <>
            <Band
              color={shown.topColor}
              placement={styles.topEdge}
              size={{ height: top.top }}
            />
            <Band
              color={shown.topColor}
              placement={styles.leftEdge}
              size={{ width: top.left }}
            />
            <Band
              color={shown.topColor}
              placement={styles.rightEdge}
              size={{ width: top.right }}
            />
            <Band
              color={shown.bottomColor}
              scrim={needsNavigationScrim}
              placement={styles.bottomEdge}
              size={{ height: insets.navigationBar.bottom }}
            />
            <Band
              color={shown.bottomColor}
              scrim={needsNavigationScrim}
              placement={styles.rightEdge}
              size={{ width: insets.navigationBar.right }}
            />
            <Band
              color={shown.bottomColor}
              scrim={needsNavigationScrim}
              placement={styles.leftEdge}
              size={{ width: insets.navigationBar.left }}
            />
          </>
        )}
      </View>
    </ParentBarsContext.Provider>
  );
}

type BandProps = {
  color: ColorValue | undefined;
  scrim?: boolean;
  placement: ViewStyle;
  size: { width: number } | { height: number };
};

function Band({ color, scrim = false, placement, size }: BandProps) {
  const thickness = 'width' in size ? size.width : size.height;
  if (color === undefined || thickness === 0) {
    return null;
  }
  return (
    <View
      pointerEvents="none"
      style={[styles.band, placement, size, { backgroundColor: color }]}
    >
      {scrim && <View style={[StyleSheet.absoluteFill, styles.scrim]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  anchor: { position: 'absolute', width: 0, height: 0 },
  band: { position: 'absolute' },
  topEdge: { top: 0, left: 0, right: 0 },
  bottomEdge: { bottom: 0, left: 0, right: 0 },
  leftEdge: { top: 0, bottom: 0, left: 0 },
  rightEdge: { top: 0, bottom: 0, right: 0 },
  scrim: { backgroundColor: '#00000080' },
});
