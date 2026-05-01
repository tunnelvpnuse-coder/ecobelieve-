export type MimiMood =
  | 'HAPPY'
  | 'CALM'
  | 'ENCOURAGING'
  | 'CURIOUS'
  | 'CAUTIOUS';

export interface MimiResponse {
  text: string;
  mood: MimiMood;
  shouldSpeak: boolean;
}

export interface MimiContext {
  userId: string;
  userType: 'KID' | 'CREATOR';
  currentMode: 'GO_OUT' | 'STAY_IN' | 'FAMILY_STUDIO';
  safetyStatus: 'SAFE' | 'CAUTION';
}

export interface MimiServiceInterface {
  askMimi(prompt: string, context: MimiContext): Promise<MimiResponse>;
  checkStreamContent(
    frameData: Buffer,
  ): Promise<{ isSafe: boolean; confidence: number }>;
}
