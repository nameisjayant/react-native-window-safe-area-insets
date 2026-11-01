import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemBarsView } from 'react-native-window-safe-area-insets';
import { AboutScreen } from './screens/AboutScreen';
import { InsetsScreen } from './screens/InsetsScreen';
import { PlaygroundScreen } from './screens/PlaygroundScreen';
import { ScenariosScreen } from './screens/ScenariosScreen';
import { useTheme } from './theme';

const TABS = ['Playground', 'Scenarios', 'Insets', 'About'] as const;

type Tab = (typeof TABS)[number];

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.tabBar,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      {TABS.map((tab) => (
        <Pressable
          key={tab}
          accessibilityRole="tab"
          accessibilityLabel={tab}
          accessibilityState={{ selected: tab === active }}
          onPress={() => onChange(tab)}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === active ? theme.accent : theme.mutedText },
            ]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function App() {
  const theme = useTheme();
  const [active, setActive] = useState<Tab>('Playground');

  const screens: Record<Tab, React.JSX.Element> = {
    Playground: <PlaygroundScreen />,
    Scenarios: <ScenariosScreen active={active === 'Scenarios'} />,
    Insets: <InsetsScreen />,
    About: <AboutScreen />,
  };

  return (
    // The tab bar sits outside the screens, so this wrapper keeps the navigation
    // bar padding below it. Screens without a wrapper of their own get its colors.
    <SystemBarsView
      statusBarColor={theme.surface}
      navigationBarColor={theme.surface}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.fill}>
        {TABS.map((tab) => (
          // Every tab stays mounted, as they do in a tab navigator.
          <View key={tab} style={tab === active ? styles.fill : styles.hidden}>
            {screens[tab]}
          </View>
        ))}
      </View>
      <TabBar active={active} onChange={setActive} />
    </SystemBarsView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
  tab: { alignItems: 'center', flex: 1, paddingVertical: 14 },
  tabText: { fontSize: 13, fontWeight: '600' },
});
