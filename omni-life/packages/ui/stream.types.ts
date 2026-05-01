export type StreamMode = 'GO_OUT' | 'STAY_IN' | 'FAMILY_STUDIO';

export type StreamStatus =
  | 'PENDING'
  | 'LIVE'
  | 'ENDED'
  | 'FLAGGED'
  | 'ARCHIVED';

export interface StreamSummary {
  id: string;
  title: string;
  mode: StreamMode;
  status: StreamStatus;
  viewerCount: number;
  isFamilySafe: boolean;
}
