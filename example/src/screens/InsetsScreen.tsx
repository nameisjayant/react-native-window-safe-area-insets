import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useWindowInsets,
  type EdgeInsets,
} from 'react-native-window-safe-area-insets';
import { Body, Card, Code, Header } from '../components';
import { useTheme } from '../theme';

const STATUS_BAR_COLOR = '#1565C0';
const CUTOUT_COLOR = '#E53935';
const NAVIGATION_BAR_COLOR = '#2E7D32';

function round(edges: EdgeInsets): EdgeInsets {
  return {
    top: Math.round(edges.top),
    right: Math.round(edges.right),
    bottom: Math.round(edges.bottom),
    left: Math.round(edges.left),
  };
}

function EdgeValues({
  name,
  color,
  edges,
}: {
  name: string;
  color: string;
  edges: EdgeInsets;
}) {
  const theme = useTheme();
  const { top, right, bottom, left } = round(edges);
  return (
    <View style={styles.values}>
      <View style={styles.valuesName}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
      </View>
      <Text style={[styles.numbers, { color: theme.mutedText }]}>
        {`top ${top}   right ${right}   bottom ${bottom}   left ${left}`}
      </Text>
    </View>
  );
}

/** Draws the insets at their real size, inside a small outline of the window. */
function Diagram({
  statusBar,
  displayCutout,
  navigationBar,
}: {
  statusBar: EdgeInsets;
  displayCutout: EdgeInsets;
  navigationBar: EdgeInsets;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.diagram,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      {(['top', 'left', 'right'] as const).map((edge) => (
        <View
          key={`cutout-${edge}`}
          style={[
            styles.band,
            edge === 'top' ? styles.topBand : styles[`${edge}Band`],
            edge === 'top'
              ? { height: displayCutout.top }
              : { width: displayCutout[edge] },
            { backgroundColor: CUTOUT_COLOR },
          ]}
        />
      ))}
      <View
        style={[
          styles.band,
          styles.topBand,
          { height: statusBar.top, backgroundColor: STATUS_BAR_COLOR },
        ]}
      />
      <View
        style={[
          styles.band,
          styles.bottomBand,
          {
            height: navigationBar.bottom,
            backgroundColor: NAVIGATION_BAR_COLOR,
          },
        ]}
      />
      <View
        style={[
          styles.band,
          styles.leftBand,
          { width: navigationBar.left, backgroundColor: NAVIGATION_BAR_COLOR },
        ]}
      />
      <View
        style={[
          styles.band,
          styles.rightBand,
          { width: navigationBar.right, backgroundColor: NAVIGATION_BAR_COLOR },
        ]}
      />
    </View>
  );
}

export function InsetsScreen() {
  const insets = useWindowInsets();
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Header
        title="Window insets"
        subtitle="useWindowInsets() updates live. Rotate the device to see the values move."
      />
      <Card title="Current values">
        <EdgeValues
          name="statusBar"
          color={STATUS_BAR_COLOR}
          edges={insets.statusBar}
        />
        <EdgeValues
          name="displayCutout"
          color={CUTOUT_COLOR}
          edges={insets.displayCutout}
        />
        <EdgeValues
          name="navigationBar"
          color={NAVIGATION_BAR_COLOR}
          edges={insets.navigationBar}
        />
      </Card>
      <Card title="To scale">
        <Diagram {...insets} />
        <Body>
          {Platform.select({
            ios: 'On iOS displayCutout is the safe area on the top, left and right, and navigationBar is the home indicator.',
            default:
              'On gesture navigation the navigation bar is thin. On three-button navigation it sits at the side of landscape phones.',
          })}
        </Body>
      </Card>
      <Card title="Usage">
        <Code>{`const insets = useWindowInsets();

<Header style={{ paddingTop: insets.statusBar.top }} />`}</Code>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 16 },
  values: { gap: 2 },
  valuesName: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  dot: { borderRadius: 5, height: 10, width: 10 },
  name: { fontSize: 15, fontWeight: '600' },
  numbers: { fontSize: 13, fontVariant: ['tabular-nums'], marginLeft: 18 },
  diagram: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 180,
    overflow: 'hidden',
    width: 280,
  },
  band: { opacity: 0.85, position: 'absolute' },
  topBand: { left: 0, right: 0, top: 0 },
  bottomBand: { bottom: 0, left: 0, right: 0 },
  leftBand: { bottom: 0, left: 0, top: 0 },
  rightBand: { bottom: 0, right: 0, top: 0 },
});
