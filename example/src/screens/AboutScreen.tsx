import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { multiply } from 'react-native-window-safe-area-insets';
import { Body, Button, Card, Code, Header } from '../components';
import { useTheme } from '../theme';

const PROPS = [
  [
    'statusBarColor',
    'Color of the status bar. Ignored while fullScreen is on.',
  ],
  ['navigationBarColor', 'Color of the navigation bar.'],
  ['fullScreen', 'Draw content behind the status bar and the cutout.'],
  [
    'statusBarStyle',
    'Status bar icon color: auto, dark-content, light-content.',
  ],
  [
    'navigationBarStyle',
    'Navigation bar icon color: auto, dark-content, light-content.',
  ],
  ['style', 'Applied to the view holding the children.'],
  ['...View props', 'Passed to the outer view.'],
] as const;

const PLATFORM_NOTES = Platform.select({
  ios: [
    'Set UIViewControllerBasedStatusBarAppearance to NO in Info.plist, or statusBarStyle is ignored.',
    'navigationBarStyle has no effect: the home indicator picks its own color.',
    'statusBarStyle has no effect inside a Modal.',
    'A pageSheet or formSheet Modal gets more padding than it needs.',
    'Avoid barStyle on React Native StatusBar alongside this component.',
  ],
  default: [
    'Android follows the minimum of React Native: Android 7 (API 24) on 0.88.',
    'The window stays edge-to-edge once a SystemBarsView has mounted.',
    'On Android 7 navigation bar icons are always light, so a light bar is dimmed.',
    'Inside a Modal set statusBarTranslucent and navigationBarTranslucent. statusBarStyle has no effect there, and three-button navigation keeps a pale scrim.',
    'Avoid barStyle on React Native StatusBar alongside this component.',
  ],
});

function Multiply() {
  const [factor, setFactor] = useState(3);
  return (
    <Card title="multiply">
      <Body>Calls a native method through the library's Turbo Module.</Body>
      <Code>{`multiply(${factor}, 7) // ${multiply(factor, 7)}`}</Code>
      <Button title="Next factor" onPress={() => setFactor(factor + 1)} />
    </Card>
  );
}

export function AboutScreen() {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Header
        title="API"
        subtitle="Everything react-native-window-safe-area-insets exports."
      />
      <Card title="SystemBarsView">
        {PROPS.map(([name, description]) => (
          <View key={name} style={styles.prop}>
            <Text style={[styles.propName, { color: theme.text }]}>{name}</Text>
            <Body>{description}</Body>
          </View>
        ))}
      </Card>
      <Card title="useWindowInsets">
        <Body>
          Returns the current statusBar, navigationBar and displayCutout insets.
          See the Insets tab.
        </Body>
      </Card>
      <Card title="Types">
        <Code>{`EdgeInsets
SystemBarStyle
SystemBarsViewProps
WindowInsets`}</Code>
      </Card>
      <Multiply />
      <Card title={`${Platform.OS === 'ios' ? 'iOS' : 'Android'} notes`}>
        {PLATFORM_NOTES.map((note) => (
          <Body key={note}>{`• ${note}`}</Body>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 16 },
  prop: { gap: 2 },
  propName: { fontSize: 15, fontWeight: '600' },
});
