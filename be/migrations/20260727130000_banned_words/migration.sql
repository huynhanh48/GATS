CREATE TABLE IF NOT EXISTS "banned_words" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "word" varchar(100) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "note" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_banned_words_word_lower"
  ON "banned_words" (lower("word"));
