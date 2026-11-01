import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { Header, ListRow } from '../components';
import { SCENARIOS, type Scenario } from './scenarios';

export function ScenariosScreen({ active }: { active: boolean }) {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (!active || scenario === null) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setScenario(null);
        return true;
      }
    );
    return () => subscription.remove();
  }, [active, scenario]);

  return (
    <View style={styles.fill}>
      {/* The list stays mounted under the open scenario, like a stack navigator. */}
      <View style={scenario === null ? styles.fill : styles.hidden}>
        <ScrollView contentContainerStyle={styles.list}>
          <Header
            title="Scenarios"
            subtitle="One screen for each thing the library does."
          />
          {SCENARIOS.map((item) => (
            <ListRow
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => setScenario(item)}
            />
          ))}
        </ScrollView>
      </View>
      {scenario !== null && (
        <scenario.Screen onBack={() => setScenario(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
  list: { gap: 10, padding: 16 },
});
