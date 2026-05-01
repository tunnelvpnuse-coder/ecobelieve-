import { Pressable, StyleSheet, View } from 'react-native';
import type { MimiMood } from '@omni-life/ui/mimi.types';

interface MimiFloatingButtonProps {
  currentMood: MimiMood;
  onPress: () => void;
}

const MOOD_COLORS: Record<MimiMood, string> = {
  HAPPY: '#FF9E80',
  CALM: '#FFF9C4',
  ENCOURAGING: '#FF9E80',
  CURIOUS: '#1A237E',
  CAUTIOUS: '#7B7B9A',
};

export default function MimiFloatingButton({
  currentMood,
  onPress,
}: MimiFloatingButtonProps): JSX.Element {
  return (
    <Pressable
      accessibilityLabel="Open MIMI"
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: MOOD_COLORS[currentMood] }]}
    >
      <View style={styles.innerRing} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 32,
    bottom: 100,
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 64,
  },
  innerRing: {
    borderColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    height: 28,
    width: 28,
  },
});
