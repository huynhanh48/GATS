-- Allow logging SePay recoveries after the 30-minute payment window.
-- Safe to re-run: only adds the enum label when missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'payment_exception_type'
      AND e.enumlabel = 'late_payment_recovered'
  ) THEN
    ALTER TYPE "public"."payment_exception_type" ADD VALUE 'late_payment_recovered';
  END IF;
END
$$;
