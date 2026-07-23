ALTER TABLE "course_includes"
  ALTER COLUMN "value" TYPE varchar(100)
  USING "value"::text;
