import db from '@src/db';
import { aiCoachMessagesTable, aiCoachSessionsTable } from '@src/db/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { z } from 'zod';
import {
  createAiCoachSessionSchema,
  updateAiCoachSessionSchema,
  addAiCoachMessageSchema,
} from '@src/schemas/ai-coach-schemas';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { chatWithViava } from '@src/services/viava/ViavaClient';

export class AiCoachService {
  public async chat(query: string, domains?: string[]) {
    const result = await chatWithViava({ query, domains });
    if (!result) {
      throw new RouteError(
        HttpStatusCodes.BAD_GATEWAY,
        'AI Coach tạm thời không phản hồi. Vui lòng thử lại.',
      );
    }
    return result;
  }

  /**
   * Get all active sessions for a user
   */
  public async getSessions(userId: number) {
    const sessions = await db
      .select()
      .from(aiCoachSessionsTable)
      .where(
        and(
          eq(aiCoachSessionsTable.userId, userId),
          isNull(aiCoachSessionsTable.deletedAt)
        )
      )
      .orderBy(desc(aiCoachSessionsTable.updatedAt));

    return sessions;
  }

  /**
   * Create a new session for a user, optionally with an initial message
   */
  public async createSession(
    userId: number,
    data: z.infer<typeof createAiCoachSessionSchema>
  ) {
    return await db.transaction(async (tx) => {
      // 1. Create the session
      const [session] = await tx
        .insert(aiCoachSessionsTable)
        .values({
          userId,
          title: data.title || 'Cuộc trò chuyện mới',
        })
        .returning();

      if (!session) {
        throw new Error('Failed to create AI Coach session');
      }

      // 2. Add initial message if provided
      if (data.initialMessage) {
        await tx.insert(aiCoachMessagesTable).values({
          sessionId: session.id,
          text: data.initialMessage.text,
          isUser: data.initialMessage.isUser,
        });
      }

      return session;
    });
  }

  /**
   * Get session details including all messages
   */
  public async getSessionDetails(sessionId: string, userId: number) {
    // 1. Verify session belongs to user and is not deleted
    const [session] = await db
      .select()
      .from(aiCoachSessionsTable)
      .where(
        and(
          eq(aiCoachSessionsTable.id, sessionId),
          eq(aiCoachSessionsTable.userId, userId),
          isNull(aiCoachSessionsTable.deletedAt)
        )
      );

    if (!session) {
      throw new Error('Session not found or unauthorized');
    }

    // 2. Get messages for the session
    const messages = await db
      .select()
      .from(aiCoachMessagesTable)
      .where(eq(aiCoachMessagesTable.sessionId, sessionId))
      .orderBy(aiCoachMessagesTable.timestamp);

    return { ...session, messages };
  }

  /**
   * Update session (e.g., change title)
   */
  public async updateSession(
    sessionId: string,
    userId: number,
    data: z.infer<typeof updateAiCoachSessionSchema>
  ) {
    const [updatedSession] = await db
      .update(aiCoachSessionsTable)
      .set({
        title: data.title,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiCoachSessionsTable.id, sessionId),
          eq(aiCoachSessionsTable.userId, userId),
          isNull(aiCoachSessionsTable.deletedAt)
        )
      )
      .returning();

    if (!updatedSession) {
      throw new Error('Session not found or unauthorized');
    }

    return updatedSession;
  }

  /**
   * Soft delete a session
   */
  public async deleteSession(sessionId: string, userId: number) {
    const [deletedSession] = await db
      .update(aiCoachSessionsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiCoachSessionsTable.id, sessionId),
          eq(aiCoachSessionsTable.userId, userId),
          isNull(aiCoachSessionsTable.deletedAt)
        )
      )
      .returning();

    if (!deletedSession) {
      throw new Error('Session not found or unauthorized');
    }

    return true;
  }

  /**
   * Add a message to an existing session
   */
  public async addMessage(
    sessionId: string,
    userId: number,
    data: z.infer<typeof addAiCoachMessageSchema>
  ) {
    return await db.transaction(async (tx) => {
      // 1. Verify session ownership and active status
      const [session] = await tx
        .select()
        .from(aiCoachSessionsTable)
        .where(
          and(
            eq(aiCoachSessionsTable.id, sessionId),
            eq(aiCoachSessionsTable.userId, userId),
            isNull(aiCoachSessionsTable.deletedAt)
          )
        );

      if (!session) {
        throw new Error('Session not found or unauthorized');
      }

      // 2. Insert message
      const [message] = await tx
        .insert(aiCoachMessagesTable)
        .values({
          sessionId,
          text: data.text,
          isUser: data.isUser,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        })
        .returning();

      // 3. Update session updatedAt
      await tx
        .update(aiCoachSessionsTable)
        .set({ updatedAt: new Date() })
        .where(eq(aiCoachSessionsTable.id, sessionId));

      return message;
    });
  }
}

export default new AiCoachService();
