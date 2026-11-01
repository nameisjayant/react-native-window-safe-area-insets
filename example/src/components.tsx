import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useTheme } from './theme';

export function Body({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Text style={[styles.body, { color: theme.mutedText }]}>{children}</Text>
  );
}

export function Code({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      selectable
      style={[
        styles.code,
        { backgroundColor: theme.codeBackground, color: theme.text },
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {title !== undefined && (
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      )}
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accent },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, { color: theme.onAccent }]}>
        {title}
      </Text>
    </Pressable>
  );
}

/** Picks one of a few values. */
export function Segmented<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.control}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {hint !== undefined && <Body>{hint}</Body>}
      <View style={[styles.segments, { borderColor: theme.border }]}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${option}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={[
                styles.segment,
                selected && { backgroundColor: theme.accent },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.segmentText,
                  { color: selected ? theme.onAccent : theme.text },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Picks a color, or none at all when `undefined` is selected. */
export function Swatches({
  label,
  hint,
  value,
  colors,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | undefined;
  colors: readonly string[];
  onChange: (color: string | undefined) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.control}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {hint !== undefined && <Body>{hint}</Body>}
      <View style={styles.swatches}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: unset`}
          accessibilityState={{ selected: value === undefined }}
          onPress={() => onChange(undefined)}
          style={[
            styles.swatch,
            styles.unsetSwatch,
            { borderColor: value === undefined ? theme.accent : theme.border },
          ]}
        >
          <Text style={[styles.unsetText, { color: theme.text }]}>unset</Text>
        </Pressable>
        {colors.map((color) => (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${color}`}
            accessibilityState={{ selected: value === color }}
            onPress={() => onChange(color)}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: value === color ? theme.accent : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        {hint !== undefined && <Body>{hint}</Body>}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.listRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.listRowText}>
        <Text style={[styles.label, { color: theme.text }]}>{title}</Text>
        <Body>{subtitle}</Body>
      </View>
      <Text style={[styles.chevron, { color: theme.mutedText }]}>›</Text>
    </Pressable>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      {onBack !== undefined && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={onBack}
        >
          <Text style={[styles.back, { color: theme.accent }]}>‹ Back</Text>
        </Pressable>
      )}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle !== undefined && <Body>{subtitle}</Body>}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 20 },
  code: {
    borderRadius: 8,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 13,
    lineHeight: 18,
    overflow: 'hidden',
    padding: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  button: { alignItems: 'center', borderRadius: 10, padding: 13 },
  buttonText: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.6 },
  control: { gap: 6 },
  label: { fontSize: 15, fontWeight: '600' },
  segments: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: { alignItems: 'center', flex: 1, paddingVertical: 10 },
  segmentText: { fontSize: 13, fontWeight: '500', paddingHorizontal: 4 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { borderRadius: 20, borderWidth: 3, height: 40, width: 40 },
  unsetSwatch: { alignItems: 'center', justifyContent: 'center' },
  unsetText: { fontSize: 10 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  switchText: { flex: 1, gap: 2 },
  listRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  listRowText: { flex: 1, gap: 2 },
  chevron: { fontSize: 24 },
  header: { gap: 6 },
  back: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '700' },
});
