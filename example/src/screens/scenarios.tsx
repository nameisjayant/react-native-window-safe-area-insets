import {
  useRef,
  useState,
  type ComponentRef,
  type ComponentType,
  type ReactNode,
} from 'react';
import {
  Image,
  Modal,
  Platform,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SystemBarsView,
  useWindowInsets,
} from 'react-native-window-safe-area-insets';
import {
  Body,
  Button,
  Card,
  Code,
  Header,
  Segmented,
  SwitchRow,
} from '../components';
import { DARK, LIGHT, ThemeOverride, useTheme } from '../theme';

const HERO_IMAGE = require('../assets/full-screen-hero.jpg');

type ScenarioProps = { onBack: () => void };

function Page({
  title,
  subtitle,
  onBack,
  children,
}: ScenarioProps & { title: string; subtitle: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Header title={title} subtitle={subtitle} onBack={onBack} />
      {children}
    </ScrollView>
  );
}

/** Where a view really sits in the window, in the same units as the insets. */
function useWindowFrame() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const onLayout = () =>
    ref.current?.measureInWindow((x, y, width, height) =>
      setFrame({ x, y, width, height })
    );
  return { ref, onLayout, frame };
}

function Measurement({
  edge,
  content,
  safeArea,
}: {
  edge: string;
  content: number;
  safeArea: number;
}) {
  const clear = Math.round(content) >= Math.round(safeArea);
  return (
    <Body>
      {`${clear ? '✓' : '✗'} ${edge}: content at ${Math.round(
        content
      )}, safe area ${Math.round(safeArea)}`}
    </Body>
  );
}

function SafeArea({ onBack }: ScenarioProps) {
  const insets = useWindowInsets();
  const window = useWindowDimensions();
  const { ref, onLayout, frame } = useWindowFrame();
  return (
    <SystemBarsView
      statusBarColor="#00695C"
      navigationBarColor="#00695C"
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <View
          ref={ref}
          collapsable={false}
          onLayout={onLayout}
          style={styles.safeAreaOutline}
        >
          <Page
            title="Safe area"
            subtitle="Everything inside SystemBarsView starts inside the safe area, on every edge. The outline is the edge of the content."
            onBack={onBack}
          >
            <Card title="Measured in the window">
              <Measurement
                edge="Top"
                content={frame.y}
                safeArea={Math.max(
                  insets.statusBar.top,
                  insets.displayCutout.top
                )}
              />
              <Measurement
                edge="Left"
                content={frame.x}
                safeArea={Math.max(
                  insets.displayCutout.left,
                  insets.navigationBar.left
                )}
              />
              <Measurement
                edge="Right"
                content={window.width - frame.x - frame.width}
                safeArea={Math.max(
                  insets.displayCutout.right,
                  insets.navigationBar.right
                )}
              />
              <Body>
                The bottom is the same, but here the tab bar sits between this
                screen and the navigation bar.
              </Body>
            </Card>
            <Card>
              <Code>{`<SystemBarsView>
  <Content />
</SystemBarsView>`}</Code>
              <Body>Rotate the device: the left and right edges follow.</Body>
            </Card>
          </Page>
        </View>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function PerScreenColors({ onBack }: ScenarioProps) {
  return (
    <SystemBarsView
      statusBarColor="#FFEB3B"
      navigationBarColor="#FFFFFF"
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <Page
          title="Per-screen colors"
          subtitle="This screen has its own wrapper. It wins while it is on screen, and the app's colors return when you go back."
          onBack={onBack}
        >
          <Card>
            <Code>{`<SystemBarsView
  statusBarColor="#FFEB3B"
  navigationBarColor="#FFFFFF"
>`}</Code>
            <Body>
              Both bars are light, so auto picks dark icons without being told.
            </Body>
          </Card>
        </Page>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function Inheritance({ onBack }: ScenarioProps) {
  const [nested, setNested] = useState(false);
  return (
    <SystemBarsView
      statusBarColor="#1565C0"
      navigationBarColor="#2E7D32"
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <Page
          title="Nested wrappers"
          subtitle="A nested wrapper keeps whatever it leaves out. The outer one still holds the padding."
          onBack={onBack}
        >
          <Card>
            <Code>{`<SystemBarsView
  statusBarColor="#1565C0"
  navigationBarColor="#2E7D32"
>
  <SystemBarsView statusBarColor="#E53935" />
</SystemBarsView>`}</Code>
            <Button
              title={nested ? 'Unmount nested wrapper' : 'Mount nested wrapper'}
              onPress={() => setNested(!nested)}
            />
            <Body>
              {nested
                ? 'The status bar comes from the nested wrapper. The navigation bar is inherited.'
                : 'Only the outer wrapper is mounted.'}
            </Body>
          </Card>
          {nested && (
            <View style={styles.nestedHost}>
              <SystemBarsView statusBarColor="#E53935">
                <Text style={styles.nestedText}>Nested wrapper</Text>
              </SystemBarsView>
            </View>
          )}
        </Page>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function BackgroundFallback({ onBack }: ScenarioProps) {
  const [background, setBackground] = useState<'light' | 'dark'>('dark');
  const palette = background === 'dark' ? DARK : LIGHT;
  return (
    <SystemBarsView style={{ backgroundColor: palette.background }}>
      <ThemeOverride value={palette}>
        <Page
          title="Background fallback"
          subtitle="No color props here. Both bars take the background of style, so the screen runs edge to edge."
          onBack={onBack}
        >
          <Card>
            <Segmented
              label="style.backgroundColor"
              hint="Icons follow it too."
              value={background}
              options={['light', 'dark'] as const}
              onChange={setBackground}
            />
          </Card>
        </Page>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function FullScreen({ onBack }: ScenarioProps) {
  const [fullScreen, setFullScreen] = useState(true);
  const insets = useWindowInsets();
  const { ref, onLayout, frame } = useWindowFrame();
  const top = Math.max(insets.statusBar.top, insets.displayCutout.top);
  return (
    <SystemBarsView
      fullScreen={fullScreen}
      navigationBarColor={DARK.background}
      style={{ backgroundColor: DARK.background }}
    >
      <ThemeOverride value={DARK}>
        <View
          ref={ref}
          collapsable={false}
          onLayout={onLayout}
          style={styles.fill}
        >
          <ScrollView contentContainerStyle={styles.fullScreenContent}>
            <View style={styles.heroImage}>
              <Image
                source={HERO_IMAGE}
                accessibilityLabel="A lake at dusk"
                style={styles.heroPhoto}
              />
              {/* useWindowInsets keeps the button clear of the status bar. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={onBack}
                style={[
                  styles.heroBack,
                  { marginTop: (fullScreen ? top : 0) + 12 },
                ]}
              >
                <Text style={styles.heroBackText}>‹ Back</Text>
              </Pressable>
            </View>
            <View style={styles.page}>
              <Header
                title="Full screen"
                subtitle="This screen is inside the wrapper in App.tsx, and its own fullScreen still wins. The image goes behind the status bar, and the App.tsx colors come back with the screen."
              />
              <Card>
                <SwitchRow
                  label="fullScreen"
                  hint={`The image starts at ${Math.round(
                    frame.y
                  )} in the window. The status bar ends at ${Math.round(top)}.`}
                  value={fullScreen}
                  onChange={setFullScreen}
                />
              </Card>
              <Card>
                <Code>{`// App.tsx
<SystemBarsView statusBarColor="#FFFFFF">
  <Navigator />
</SystemBarsView>

// One screen
<SystemBarsView fullScreen>
  <Image source={photo} style={styles.photo} />
  <BackButton style={{ top: insets.statusBar.top }} />
</SystemBarsView>`}</Code>
              </Card>
            </View>
          </ScrollView>
        </View>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function IconStyles({ onBack }: ScenarioProps) {
  const [style, setStyle] = useState<'dark-content' | 'light-content'>(
    'dark-content'
  );
  return (
    <SystemBarsView
      statusBarColor="#90A4AE"
      navigationBarColor="#90A4AE"
      statusBarStyle={style}
      navigationBarStyle={style}
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <Page
          title="Forced icon color"
          subtitle="On a mid-tone bar either color is readable, so choose one instead of auto."
          onBack={onBack}
        >
          <Card>
            <Segmented
              label="statusBarStyle and navigationBarStyle"
              value={style}
              options={['dark-content', 'light-content'] as const}
              onChange={setStyle}
            />
          </Card>
        </Page>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function DynamicColors({ onBack }: ScenarioProps) {
  const theme = useTheme();
  const color = Platform.select({
    ios: PlatformColor('systemTeal'),
    default: PlatformColor('@android:color/system_accent1_200'),
  });
  // PlatformColor needs a resource Android 12 added. Older versions skip it.
  const supported = Platform.OS === 'ios' || Number(Platform.Version) >= 31;
  return (
    <SystemBarsView
      statusBarColor={supported ? color : '#00897B'}
      navigationBarColor={supported ? color : '#00897B'}
      style={{ backgroundColor: theme.background }}
    >
      <Page
        title="Dynamic colors"
        subtitle="PlatformColor works too. It cannot be inspected, so auto picks icons from the system theme instead of the color."
        onBack={onBack}
      >
        <Card>
          <Code>{`<SystemBarsView
  statusBarColor={PlatformColor('${
    Platform.OS === 'ios' ? 'systemTeal' : '@android:color/system_accent1_200'
  }')}
>`}</Code>
          <Body>
            Switch the device between light and dark to see it follow.
          </Body>
        </Card>
      </Page>
    </SystemBarsView>
  );
}

function NoWrapper({ onBack }: ScenarioProps) {
  return (
    <Page
      title="No wrapper"
      subtitle="This screen renders no SystemBarsView, so the wrapper in App.tsx stays in charge."
      onBack={onBack}
    >
      <Card>
        <Body>
          Wrap once around the app, then add a wrapper only to the screens that
          differ.
        </Body>
      </Card>
    </Page>
  );
}

const INNER_TABS = [
  { name: 'Blue', status: '#1565C0', navigation: '#0D47A1' },
  { name: 'Green', status: '#2E7D32', navigation: '#1B5E20' },
  { name: 'Yellow', status: '#FFEB3B', navigation: '#FBC02D' },
] as const;

function InnerTabs({ onBack }: ScenarioProps) {
  const [active, setActive] = useState<string>(INNER_TABS[0].name);
  return (
    <View style={styles.fill}>
      {INNER_TABS.map((tab) => (
        // Every tab stays mounted, as they do in a tab navigator.
        <View
          key={tab.name}
          style={tab.name === active ? styles.fill : styles.hidden}
        >
          <SystemBarsView
            statusBarColor={tab.status}
            navigationBarColor={tab.navigation}
            style={{ backgroundColor: LIGHT.background }}
          >
            <ThemeOverride value={LIGHT}>
              <Page
                title={`${tab.name} tab`}
                subtitle="All three tabs are mounted, each with its own wrapper. Only the one on screen sets the bars."
                onBack={onBack}
              >
                <Card>
                  <Segmented
                    label="Tab"
                    value={active}
                    options={INNER_TABS.map(({ name }) => name)}
                    onChange={setActive}
                  />
                </Card>
              </Page>
            </ThemeOverride>
          </SystemBarsView>
        </View>
      ))}
    </View>
  );
}

function Modals({ onBack }: ScenarioProps) {
  const [visible, setVisible] = useState(false);
  return (
    <SystemBarsView
      statusBarColor="#37474F"
      navigationBarColor="#37474F"
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <Page
          title="Modal"
          subtitle="A wrapper inside a Modal draws its own bars and leaves the screen behind it alone."
          onBack={onBack}
        >
          <Card>
            <Button title="Open modal" onPress={() => setVisible(true)} />
            <Body>
              {Platform.select({
                ios: 'statusBarStyle has no effect inside a Modal: iOS keeps its default icons, so choose a color that suits them.',
                default:
                  'statusBarStyle has no effect inside a Modal, which has a window of its own. With three-button navigation the system also keeps a pale scrim over its navigation bar.',
              })}
            </Body>
          </Card>
        </Page>
        <Modal
          visible={visible}
          animationType="none"
          // Android only. They let the Modal's content reach behind both bars.
          statusBarTranslucent
          navigationBarTranslucent
          supportedOrientations={['portrait', 'landscape']}
          onRequestClose={() => setVisible(false)}
        >
          <SystemBarsView
            statusBarColor={Platform.select({
              ios: '#80DEEA',
              default: '#00838F',
            })}
            navigationBarColor="#00838F"
            style={styles.modalBackground}
          >
            <View style={styles.modal}>
              <Header
                title="Inside a Modal"
                subtitle="These bars belong to the Modal."
              />
              <Button title="Close modal" onPress={() => setVisible(false)} />
            </View>
          </SystemBarsView>
        </Modal>
      </ThemeOverride>
    </SystemBarsView>
  );
}

function ViewProps({ onBack }: ScenarioProps) {
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <SystemBarsView
      testID="view-props-wrapper"
      accessibilityLabel="Wrapper with view props"
      onLayout={(event) => setSize(event.nativeEvent.layout)}
      statusBarColor="#5D4037"
      navigationBarColor="#5D4037"
      style={{ backgroundColor: LIGHT.background }}
    >
      <ThemeOverride value={LIGHT}>
        <Page
          title="View props"
          subtitle="Anything a View takes passes through to the outer view, including testID and onLayout."
          onBack={onBack}
        >
          <Card>
            <Code>{`<SystemBarsView
  testID="view-props-wrapper"
  onLayout={(event) => setSize(event.nativeEvent.layout)}
>`}</Code>
            <Body>
              {`onLayout measured ${Math.round(size.width)} × ${Math.round(
                size.height
              )}, in a ${Math.round(window.width)} × ${Math.round(
                window.height
              )} window.`}
            </Body>
          </Card>
        </Page>
      </ThemeOverride>
    </SystemBarsView>
  );
}

export type Scenario = {
  title: string;
  subtitle: string;
  Screen: ComponentType<ScenarioProps>;
};

export const SCENARIOS: Scenario[] = [
  {
    title: 'Safe area',
    subtitle: 'Content starts inside the safe area, measured live.',
    Screen: SafeArea,
  },
  {
    title: 'Per-screen colors',
    subtitle: 'A screen overrides the app, then hands the bars back.',
    Screen: PerScreenColors,
  },
  {
    title: 'Nested wrappers',
    subtitle: 'Props a wrapper leaves out are inherited.',
    Screen: Inheritance,
  },
  {
    title: 'Background fallback',
    subtitle: 'Bars take the background of style.',
    Screen: BackgroundFallback,
  },
  {
    title: 'Full screen',
    subtitle: 'An image behind the status bar, inside the App.tsx wrapper.',
    Screen: FullScreen,
  },
  {
    title: 'Forced icon color',
    subtitle: 'dark-content and light-content instead of auto.',
    Screen: IconStyles,
  },
  {
    title: 'Dynamic colors',
    subtitle: 'PlatformColor as a bar color.',
    Screen: DynamicColors,
  },
  {
    title: 'No wrapper',
    subtitle: 'A screen without one falls back to App.tsx.',
    Screen: NoWrapper,
  },
  {
    title: 'Mounted tabs',
    subtitle: 'Hidden tabs keep their wrappers but not the bars.',
    Screen: InnerTabs,
  },
  {
    title: 'Modal',
    subtitle: 'A wrapper in a Modal gets bars of its own.',
    Screen: Modals,
  },
  {
    title: 'View props',
    subtitle: 'testID, onLayout and friends pass through.',
    Screen: ViewProps,
  },
];

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
  page: { gap: 16, padding: 16 },
  nestedHost: { borderRadius: 14, height: 80, overflow: 'hidden' },
  nestedText: { color: LIGHT.mutedText, padding: 12 },
  safeAreaOutline: { borderColor: '#00695C', borderWidth: 2, flex: 1 },
  fullScreenContent: { flexGrow: 1 },
  heroImage: { height: 340, overflow: 'hidden' },
  // An explicit size, or the image takes the natural size of the asset.
  heroPhoto: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  heroBack: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    backgroundColor: '#00000080',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  modalBackground: { backgroundColor: '#E0F7FA' },
  modal: { flex: 1, gap: 24, justifyContent: 'center', padding: 16 },
});
