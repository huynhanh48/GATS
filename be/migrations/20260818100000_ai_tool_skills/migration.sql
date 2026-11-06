-- Adds the "skill" value to the ai_tool_type enum.
-- The enum itself + ai_tool_configs table are created by
-- 20260817120000_ai_tool_configs (copied from be/drizzle/, see README).
ALTER TYPE "public"."ai_tool_type" ADD VALUE IF NOT EXISTS 'skill';
