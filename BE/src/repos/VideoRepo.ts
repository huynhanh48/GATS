import { eq, sql } from 'drizzle-orm';

import db from '@src/db';
import { videoRenditionsTable } from '@src/db/schema/video-rendition';
import {
  videosTable,
  type NewVideo,
  type VideoStatus,
} from '@src/db/schema/video';
import {
  type VideoRecord,
  parseVideoRecord,
} from '@src/models/Video.model';

function parseRow(row: unknown): VideoRecord {
  return parseVideoRecord(row);
}

export async function findById(id: string): Promise<VideoRecord | undefined> {
  const rows = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByLessonId(
  lessonId: string,
): Promise<VideoRecord | undefined> {
  const rows = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.lessonId, lessonId))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function create(data: NewVideo): Promise<VideoRecord> {
  const rows = await db.insert(videosTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function updateById(
  id: string,
  data: Partial<NewVideo>,
): Promise<VideoRecord | undefined> {
  const rows = await db
    .update(videosTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(videosTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function updateStatus(
  id: string,
  status: VideoStatus,
  extra: Partial<NewVideo> = {},
): Promise<VideoRecord | undefined> {
  return updateById(id, { status, ...extra });
}

export type TranscodeSuccessData = {
  hlsKey: string;
  audioFlacKey?: string | null;
  duration?: number | null;
  renditions: Array<{
    resolution: string;
    bitrate?: number | null;
    playlistKey: string;
  }>;
};

export async function updateAfterTranscode(
  videoId: string,
  data: TranscodeSuccessData,
): Promise<VideoRecord | undefined> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .update(videosTable)
      .set({
        status: 'ready',
        hlsKey: data.hlsKey,
        audioFlacKey: data.audioFlacKey ?? null,
        duration: data.duration ?? null,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(videosTable.id, videoId))
      .returning();

    if (!rows[0]) return undefined;

    if (data.renditions.length > 0) {
      await tx
        .insert(videoRenditionsTable)
        .values(
          data.renditions.map((rendition) => ({
            videoId,
            resolution: rendition.resolution,
            bitrate: rendition.bitrate ?? null,
            playlistKey: rendition.playlistKey,
          })),
        )
        .onConflictDoUpdate({
          target: [videoRenditionsTable.videoId, videoRenditionsTable.resolution],
          set: {
            bitrate: sql`excluded.bitrate`,
            playlistKey: sql`excluded.playlist_key`,
          },
        });
    }

    return parseRow(rows[0]);
  });
}

export async function markFailed(
  id: string,
  errorMessage: string,
): Promise<VideoRecord | undefined> {
  const truncated =
    errorMessage.length > 500 ? errorMessage.slice(0, 497) + '...' : errorMessage;
  return updateById(id, { status: 'failed', errorMessage: truncated });
}

export async function deleteById(id: string): Promise<boolean> {
  const rows = await db
    .delete(videosTable)
    .where(eq(videosTable.id, id))
    .returning({ id: videosTable.id });
  return rows.length > 0;
}
