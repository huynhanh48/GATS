import type { Server as HttpServer } from 'http';
import logger from 'jet-logger';
import { Server, type Socket } from 'socket.io';

import { getAllowedOrigins } from '@src/common/utils/cors';
import { RealtimeEventBus } from '@src/realtime/realtime-event-bus';
import {
  buildVideoRoom,
  type ClientToServerEvents,
  type InterServerEvents,
  isSafeRealtimeRoom,
  type RealtimeAck,
  type RealtimeServerEvent,
  type ServerToClientEvents,
  type SocketData,
  type VideoProgressPayload,
} from '@src/realtime/realtime-events';

type RealtimeSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

function ackOk(ack?: (response: RealtimeAck) => void): void {
  ack?.({ ok: true });
}

function ackError(error: string, ack?: (response: RealtimeAck) => void): void {
  ack?.({ ok: false, error });
}

function nowIso(): string {
  return new Date().toISOString();
}

export class RealtimeSocketServer {
  private readonly io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  private readonly bus: RealtimeEventBus;

  constructor(httpServer: HttpServer, bus = new RealtimeEventBus()) {
    this.bus = bus;
    this.io = new Server(httpServer, {
      cors: {
        origin(origin, callback) {
          if (!origin || getAllowedOrigins().includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Socket origin not allowed'));
        },
        credentials: true,
      },
    });
  }

  async start(): Promise<void> {
    this.io.on('connection', (socket) => this.handleConnection(socket));
    await this.bus.subscribe((event) => this.handleBusEvent(event));
    logger.info('Realtime Socket.IO server started');
  }

  async close(): Promise<void> {
    await this.bus.close();
    await this.io.close();
  }

  emitVideoProgress(payload: VideoProgressPayload): void {
    this.io.to(buildVideoRoom(payload.videoId)).emit('video:progress', payload);
  }

  private handleBusEvent(event: RealtimeServerEvent): void {
    if (event.type === 'video:progress') {
      this.io.to(event.room).emit('video:progress', event.payload);
    }
  }

  private handleConnection(socket: RealtimeSocket): void {
    socket.data.joinedRooms = new Set<string>();

    socket.on('realtime:join', (payload, ack) => {
      const room = payload?.room;
      if (!room || !isSafeRealtimeRoom(room)) {
        ackError('Invalid room', ack);
        return;
      }
      void socket.join(room);
      socket.data.joinedRooms.add(room);
      ackOk(ack);
    });

    socket.on('realtime:leave', (payload, ack) => {
      const room = payload?.room;
      if (!room || !isSafeRealtimeRoom(room)) {
        ackError('Invalid room', ack);
        return;
      }
      void socket.leave(room);
      socket.data.joinedRooms.delete(room);
      ackOk(ack);
    });

    socket.on('video:subscribe', (payload, ack) => {
      const videoId = payload?.videoId;
      if (!videoId) {
        ackError('videoId is required', ack);
        return;
      }
      const room = buildVideoRoom(videoId);
      void socket.join(room);
      socket.data.joinedRooms.add(room);
      ackOk(ack);
    });

    socket.on('video:unsubscribe', (payload, ack) => {
      const videoId = payload?.videoId;
      if (!videoId) {
        ackError('videoId is required', ack);
        return;
      }
      const room = buildVideoRoom(videoId);
      void socket.leave(room);
      socket.data.joinedRooms.delete(room);
      ackOk(ack);
    });

    socket.on('video:upload:progress', (payload, ack) => {
      const videoId = payload?.videoId;
      if (!videoId) {
        ackError('videoId is required', ack);
        return;
      }

      const rawProgress =
        typeof payload.progressPct === 'number' ? payload.progressPct : 0;
      const progressPct = Math.max(0, Math.min(100, rawProgress));
      this.emitVideoProgress({
        ...payload,
        phase: 'upload',
        status: progressPct >= 100 ? 'completed' : 'running',
        progressPct,
        updatedAt: nowIso(),
      });
      ackOk(ack);
    });
  }
}

let realtimeServer: RealtimeSocketServer | undefined;

export async function initializeRealtimeSocketServer(
  httpServer: HttpServer,
): Promise<RealtimeSocketServer> {
  realtimeServer ??= new RealtimeSocketServer(httpServer);
  await realtimeServer.start();
  return realtimeServer;
}
