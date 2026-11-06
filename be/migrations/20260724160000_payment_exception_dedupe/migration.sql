-- Collapse duplicate open rows before enforcing uniqueness.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "txn_ref", "type"
      ORDER BY "created_at" DESC
    ) AS rn
  FROM "payment_exceptions"
  WHERE "resolved" = false AND "txn_ref" IS NOT NULL
)
UPDATE "payment_exceptions" AS pe
SET
  "resolved" = true,
  "resolved_at" = NOW(),
  "resolution_note" = TRIM(
    BOTH FROM CONCAT(
      COALESCE(pe."resolution_note", ''),
      ' [auto-dedupe duplicate]'
    )
  )
FROM ranked
WHERE pe.id = ranked.id AND ranked.rn > 1;

-- At most one unresolved exception per (txn_ref, type) so webhook + poll
-- retries do not flood the admin "Ngoại lệ thanh toán" list.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_exceptions_unresolved_txn_type
ON "payment_exceptions" ("txn_ref", "type")
WHERE "resolved" = false AND "txn_ref" IS NOT NULL;
