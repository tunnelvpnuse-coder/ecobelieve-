import { Text, View } from 'react-native';

interface MimiInteractionModalProps {
  visible: boolean;
}

export default function MimiInteractionModal({
  visible,
}: MimiInteractionModalProps): JSX.Element {
  return (
    <View>
      <Text>{visible ? 'MIMI modal open' : 'MIMI modal closed'}</Text>
    </View>
  );
}
