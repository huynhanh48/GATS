-- Order refund 2-step: refund_pending + bank/reason fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'order_status'
      AND e.enumlabel = 'refund_pending'
  ) THEN
    ALTER TYPE "public"."order_status" ADD VALUE 'refund_pending';
  END IF;
END
$$;

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "refund_reason_code" varchar(50),
  ADD COLUMN IF NOT EXISTS "refund_reason_note" text,
  ADD COLUMN IF NOT EXISTS "refund_bank_name" varchar(120),
  ADD COLUMN IF NOT EXISTS "refund_account_number" varchar(50),
  ADD COLUMN IF NOT EXISTS "refund_account_holder" varchar(255),
  ADD COLUMN IF NOT EXISTS "refund_requested_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "refund_completed_at" timestamp with time zone;
