export const REALTIME_REDIS_CHANNEL = 'gats:realtime:v1';

export type RealtimeRoomKind = 'video' | 'chat' | 'comment' | 'group-chat';

export type VideoProgressPhase =
  'upload' | 'download' | 'transcode' | 'hls_upload' | 'complete' | 'failed';

export type VideoProgressStatus = 'queued' | 'running' | 'completed' | 'failed';

export type VideoProgressPayload = {
  videoId: string;
  courseId?: string;
  lessonId?: string;
  phase: VideoProgressPhase;
  status: VideoProgressStatus;
  progressPct?: number;
  loadedBytes?: number;
  totalBytes?: number;
  message?: string;
  errorMessage?: string;
  updatedAt: string;
};

export type RealtimeServerEvent = {
  type: 'video:progress';
  room: string;
  payload: VideoProgressPayload;
};

export type RoomSubscriptionPayload = {
  room: string;
};

export type VideoSubscriptionPayload = {
  videoId: string;
};

export type RealtimeAck = {
  ok: boolean;
  error?: string;
};

export type ServerToClientEvents = {
  'video:progress': (payload: VideoProgressPayload) => void;
};

export type ClientToServerEvents = {
  'realtime:join': (
    payload: RoomSubscriptionPayload,
    ack?: (response: RealtimeAck) => void,
  ) => void;
  'realtime:leave': (
    payload: RoomSubscriptionPayload,
    ack?: (response: RealtimeAck) => void,
  ) => void;
  'video:subscribe': (
    payload: VideoSubscriptionPayload,
    ack?: (response: RealtimeAck) => void,
  ) => void;
  'video:unsubscribe': (
    payload: VideoSubscriptionPayload,
    ack?: (response: RealtimeAck) => void,
  ) => void;
  'video:upload:progress': (
    payload: Omit<VideoProgressPayload, 'phase' | 'status' | 'updatedAt'> & {
      progressPct: number;
    },
    ack?: (response: RealtimeAck) => void,
  ) => void;
};

export type InterServerEvents = Record<string, never>;
export type SocketData = {
  joinedRooms: Set<string>;
};

export function buildRealtimeRoom(kind: RealtimeRoomKind, id: string): string {
  return `${kind}:${id}`;
}

export function buildVideoRoom(videoId: string): string {
  return buildRealtimeRoom('video', videoId);
}

export function isSafeRealtimeRoom(room: string): boolean {
  return /^(video|chat|comment|group-chat):[a-zA-Z0-9:_-]{1,128}$/.test(room);
}
