-- Flashcard course admin: lifecycle + hint/order/lesson linkage

ALTER TABLE "flashcard_decks"
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lesson_id" uuid;

ALTER TABLE "flashcards"
  ADD COLUMN IF NOT EXISTS "hint" text,
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'published';

-- Existing decks stay visible to enrolled learners after deploy
UPDATE "flashcard_decks" SET "status" = 'published' WHERE "status" = 'draft';
UPDATE "flashcards" SET "status" = 'published' WHERE "status" IS NULL OR "status" = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'flashcard_decks_lesson_id_fkey'
  ) THEN
    ALTER TABLE "flashcard_decks"
      ADD CONSTRAINT "flashcard_decks_lesson_id_fkey"
      FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_flashcard_decks_course_status"
  ON "flashcard_decks" ("course_id", "status", "sort_order");

CREATE INDEX IF NOT EXISTS "idx_flashcards_deck_status_order"
  ON "flashcards" ("deck_id", "status", "sort_order");
