CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(100) NOT NULL,
	"bank_name" varchar(100) NOT NULL,
	"bank_code" varchar(50) NOT NULL,
	"account_number" varchar(30) NOT NULL,
	"account_holder" varchar(100) NOT NULL,
	"bank_branch" varchar(100),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bank_accounts_one_default"
  ON "bank_accounts" ("is_default")
  WHERE "is_default" = true AND "is_active" = true;
