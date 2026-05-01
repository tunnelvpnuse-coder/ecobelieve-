import { StyleSheet, Text, View } from 'react-native';

interface ScreenScaffoldProps {
  title: string;
}

export default function ScreenScaffold({
  title,
}: ScreenScaffoldProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Omni Life screen scaffold</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#1A237E',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#7B7B9A',
    fontSize: 14,
    marginTop: 8,
  },
});
