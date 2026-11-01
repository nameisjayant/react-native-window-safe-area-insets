import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SystemBarsView,
  useWindowInsets,
  type SystemBarStyle,
} from 'react-native-window-safe-area-insets';
import {
  Button,
  Card,
  Code,
  Segmented,
  SwitchRow,
  Swatches,
} from '../components';
import { DARK, LIGHT, ThemeOverride } from '../theme';

const COLORS = [
  '#1565C0',
  '#2E7D32',
  '#E53935',
  '#FFEB3B',
  '#FFFFFF',
  '#212121',
] as const;

const BAR_STYLES = ['auto', 'dark-content', 'light-content'] as const;
const BACKGROUNDS = ['light', 'dark'] as const;

type Background = (typeof BACKGROUNDS)[number];

const DEFAULTS = {
  statusBarColor: '#1565C0' as string | undefined,
  navigationBarColor: '#2E7D32' as string | undefined,
  fullScreen: false,
  statusBarStyle: 'auto' as SystemBarStyle,
  navigationBarStyle: 'auto' as SystemBarStyle,
  background: 'light' as Background,
};

const HERO_COLOR = '#7B1FA2';

function toJsx(props: typeof DEFAULTS): string {
  const palette = props.background === 'dark' ? DARK : LIGHT;
  const lines = [
    props.statusBarColor && `statusBarColor="${props.statusBarColor}"`,
    props.navigationBarColor &&
      `navigationBarColor="${props.navigationBarColor}"`,
    props.fullScreen && 'fullScreen',
    props.statusBarStyle !== 'auto' &&
      `statusBarStyle="${props.statusBarStyle}"`,
    props.navigationBarStyle !== 'auto' &&
      `navigationBarStyle="${props.navigationBarStyle}"`,
    `style={{ backgroundColor: '${palette.background}' }}`,
  ].filter(Boolean);
  return `<SystemBarsView\n${lines.map((line) => `  ${line}`).join('\n')}\n>`;
}

export function PlaygroundScreen() {
  const [props, setProps] = useState(DEFAULTS);
  const update = (change: Partial<typeof DEFAULTS>) =>
    setProps((current) => ({ ...current, ...change }));

  const insets = useWindowInsets();
  const palette = props.background === 'dark' ? DARK : LIGHT;

  // In full screen nothing keeps the title clear of the status bar any more.
  const heroPaddingTop = props.fullScreen
    ? Math.max(insets.statusBar.top, insets.displayCutout.top)
    : 0;

  return (
    <SystemBarsView
      statusBarColor={props.statusBarColor}
      navigationBarColor={props.navigationBarColor}
      fullScreen={props.fullScreen}
      statusBarStyle={props.statusBarStyle}
      navigationBarStyle={props.navigationBarStyle}
      style={{ backgroundColor: palette.background }}
    >
      <ThemeOverride value={palette}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.hero, { paddingTop: heroPaddingTop + 16 }]}>
            <Text style={styles.heroTitle}>Playground</Text>
            <Text style={styles.heroText}>
              Every prop of SystemBarsView, live.
            </Text>
          </View>

          <View style={styles.cards}>
            <Card title="Colors">
              <Swatches
                label="statusBarColor"
                hint={
                  props.fullScreen
                    ? 'Ignored while fullScreen is on.'
                    : 'Unset falls back to the background of style.'
                }
                value={props.statusBarColor}
                colors={COLORS}
                onChange={(statusBarColor) => update({ statusBarColor })}
              />
              <Swatches
                label="navigationBarColor"
                hint={Platform.select({
                  ios: 'The area around the home indicator.',
                  default: 'Unset falls back to the background of style.',
                })}
                value={props.navigationBarColor}
                colors={COLORS}
                onChange={(navigationBarColor) =>
                  update({ navigationBarColor })
                }
              />
              <Segmented
                label="style.backgroundColor"
                value={props.background}
                options={BACKGROUNDS}
                onChange={(background) => update({ background })}
              />
            </Card>

            <Card title="Layout">
              <SwitchRow
                label="fullScreen"
                hint="Draws content behind the status bar and the cutout. The purple header slides up behind it."
                value={props.fullScreen}
                onChange={(fullScreen) => update({ fullScreen })}
              />
            </Card>

            <Card title="Icon color">
              <Segmented
                label="statusBarStyle"
                hint="auto picks whichever is readable on the bar."
                value={props.statusBarStyle}
                options={BAR_STYLES}
                onChange={(statusBarStyle) => update({ statusBarStyle })}
              />
              <Segmented
                label="navigationBarStyle"
                hint={Platform.select({
                  ios: 'No effect on iOS: the home indicator picks its own color.',
                  default:
                    'On Android 7 icons are always light, so a light bar is dimmed.',
                })}
                value={props.navigationBarStyle}
                options={BAR_STYLES}
                onChange={(navigationBarStyle) =>
                  update({ navigationBarStyle })
                }
              />
            </Card>

            <Card title="Your code">
              <Code>{toJsx(props)}</Code>
              <Button title="Reset" onPress={() => setProps(DEFAULTS)} />
            </Card>
          </View>
        </ScrollView>
      </ThemeOverride>
    </SystemBarsView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16 },
  hero: {
    backgroundColor: HERO_COLOR,
    gap: 4,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  heroText: { color: '#FFFFFF', fontSize: 14 },
  cards: { gap: 12, padding: 16 },
});
