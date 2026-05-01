import { Text, View } from 'react-native';

export interface CameraPreviewProps {
  mode: 'GO_OUT' | 'STAY_IN' | 'FAMILY_STUDIO';
  isLive: boolean;
  isFamilySafe: boolean;
  onFrameCapture?: (frame: string) => void;
  onSafetyFlag?: (isSafe: boolean) => void;
}

export default function CameraPreview({
  mode,
  isLive,
  isFamilySafe,
}: CameraPreviewProps): JSX.Element {
  return (
    <View>
      <Text>{`Camera Preview (${mode})`}</Text>
      <Text>{isLive ? 'LIVE' : 'OFFLINE'}</Text>
      <Text>{isFamilySafe ? 'SAFE' : 'CAUTION'}</Text>
    </View>
  );
}
