"use client";

import { io, type Socket } from "socket.io-client";
import { BE_API_URL } from "@/lib/api/config";

export type VideoProgressPhase =
  | "upload"
  | "download"
  | "transcode"
  | "hls_upload"
  | "complete"
  | "failed";

export type VideoProgressStatus = "queued" | "running" | "completed" | "failed";

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

type ServerToClientEvents = {
  "video:progress": (payload: VideoProgressPayload) => void;
};

type ClientToServerEvents = {
  "video:subscribe": (
    payload: { videoId: string },
    ack?: (response: { ok: boolean; error?: string }) => void,
  ) => void;
  "video:unsubscribe": (
    payload: { videoId: string },
    ack?: (response: { ok: boolean; error?: string }) => void,
  ) => void;
  "video:upload:progress": (
    payload: {
      videoId: string;
      courseId?: string;
      lessonId?: string;
      progressPct: number;
      loadedBytes?: number;
      totalBytes?: number;
      message?: string;
    },
    ack?: (response: { ok: boolean; error?: string }) => void,
  ) => void;
};

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: RealtimeSocket | null = null;

function getSocketUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BE_SOCKET_URL ??
    process.env.NEXT_PUBLIC_BE_API_URL ??
    BE_API_URL
  ).replace(/\/$/, "");
}

export function getRealtimeSocket(): RealtimeSocket {
  if (socket) return socket;
  socket = io(getSocketUrl(), {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function ensureRealtimeConnected(): RealtimeSocket {
  const realtime = getRealtimeSocket();
  if (!realtime.connected) realtime.connect();
  return realtime;
}

export function subscribeToVideoProgress(
  videoId: string,
  handler: (payload: VideoProgressPayload) => void,
): () => void {
  const realtime = ensureRealtimeConnected();
  const wrapped = (payload: VideoProgressPayload) => {
    if (payload.videoId === videoId) handler(payload);
  };

  realtime.emit("video:subscribe", { videoId });
  realtime.on("video:progress", wrapped);

  return () => {
    realtime.off("video:progress", wrapped);
    realtime.emit("video:unsubscribe", { videoId });
  };
}

export function publishVideoUploadProgress(payload: {
  videoId: string;
  courseId?: string;
  lessonId?: string;
  progressPct: number;
  loadedBytes?: number;
  totalBytes?: number;
  message?: string;
}): void {
  const realtime = ensureRealtimeConnected();
  realtime.emit("video:upload:progress", payload);
}
