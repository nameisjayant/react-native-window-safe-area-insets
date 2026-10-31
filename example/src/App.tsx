import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SystemBarsView,
  useWindowInsets,
} from 'react-native-window-safe-area-insets';

type Screen = {
  name: string;
  statusBarColor?: string;
  navigationBarColor?: string;
  fullScreen?: boolean;
  background: string;
  text: string;
};

const SCREENS: Screen[] = [
  {
    name: 'dark bars',
    statusBarColor: '#1565C0',
    navigationBarColor: '#2E7D32',
    background: '#ECEFF1',
    text: '#102027',
  },
  {
    name: 'light bars',
    statusBarColor: '#FFEB3B',
    navigationBarColor: '#FFFFFF',
    background: '#FFF8E1',
    text: '#102027',
  },
  {
    name: 'full screen',
    navigationBarColor: '#4A148C',
    fullScreen: true,
    background: '#E53935',
    text: '#FFFFFF',
  },
  {
    name: 'no colors',
    background: '#263238',
    text: '#FFFFFF',
  },
];

function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable testID={title} style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

function Tab({ screen }: { screen: Screen }) {
  const insets = useWindowInsets();
  return (
    <SystemBarsView
      statusBarColor={screen.statusBarColor}
      navigationBarColor={screen.navigationBarColor}
      fullScreen={screen.fullScreen}
      style={{ backgroundColor: screen.background }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: screen.text }]}>
          {screen.name}
        </Text>
        <Text style={{ color: screen.text }}>
          {JSON.stringify(insets, null, 1)}
        </Text>
      </ScrollView>
    </SystemBarsView>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [hideActive, setHideActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SystemBarsView statusBarColor="#212121" navigationBarColor="#212121">
      <View style={styles.tabs}>
        {SCREENS.map((screen, i) => (
          // Every tab stays mounted, as they do in a tab navigator.
          <View
            key={screen.name}
            style={i === index && !hideActive ? styles.tab : styles.hidden}
          >
            <Tab screen={screen} />
          </View>
        ))}
        {hideActive && (
          <View style={styles.unwrapped}>
            <Text style={styles.title}>app-level wrapper</Text>
          </View>
        )}
      </View>
      <View style={styles.toolbar}>
        <Button
          title="next"
          onPress={() => {
            setHideActive(false);
            setIndex((index + 1) % SCREENS.length);
          }}
        />
        <Button title="app" onPress={() => setHideActive(!hideActive)} />
        <Button title="modal" onPress={() => setModalVisible(true)} />
      </View>
      <Modal
        visible={modalVisible}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <SystemBarsView statusBarColor="#00838F" navigationBarColor="#00838F">
          <View style={styles.modal}>
            <Button title="close" onPress={() => setModalVisible(false)} />
          </View>
        </SystemBarsView>
      </Modal>
    </SystemBarsView>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  tab: { flex: 1 },
  hidden: { display: 'none' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  unwrapped: { flex: 1, padding: 16, backgroundColor: '#BDBDBD' },
  toolbar: { flexDirection: 'row', backgroundColor: '#FFFFFF' },
  button: { flex: 1, padding: 12, alignItems: 'center' },
  buttonText: { color: '#1565C0', fontWeight: '600' },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: '#E0F7FA' },
});
