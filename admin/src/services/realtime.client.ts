"use client";

import { io, type Socket } from "socket.io-client";
import { resolvePublicApiUrl } from "@/lib/api/public-api";

export type VideoProgressPhase =
  | "upload"
  | "download"
  | "transcode"
  | "hls_upload"
  | "extracting_audio"
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
/** After reconnect budget is exhausted, do not open more connections. */
let giveUp = false;

function getSocketUrl(): string {
  return resolvePublicApiUrl();
}

export function getRealtimeSocket(): RealtimeSocket {
  if (socket) return socket;

  socket = io(getSocketUrl(), {
    autoConnect: false,
    withCredentials: true,
    // Websocket only — avoids long-polling spam when BE has no socket.io
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 2,
    reconnectionDelay: 2000,
    timeout: 4000,
  });

  socket.io.on("reconnect_failed", () => {
    giveUp = true;
    socket?.disconnect();
  });

  socket.on("connect_error", () => {
    // First failures still count toward reconnectionAttempts; no extra work.
  });

  return socket;
}

export function ensureRealtimeConnected(): RealtimeSocket {
  const realtime = getRealtimeSocket();
  if (giveUp) return realtime;
  if (!realtime.connected) {
    realtime.connect();
  }
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

  if (realtime.connected) {
    realtime.emit("video:subscribe", { videoId });
  } else {
    realtime.once("connect", () => {
      realtime.emit("video:subscribe", { videoId });
    });
  }
  realtime.on("video:progress", wrapped);

  return () => {
    realtime.off("video:progress", wrapped);
    if (realtime.connected) {
      realtime.emit("video:unsubscribe", { videoId });
    }
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
  if (!realtime.connected) return;
  realtime.emit("video:upload:progress", payload);
}
