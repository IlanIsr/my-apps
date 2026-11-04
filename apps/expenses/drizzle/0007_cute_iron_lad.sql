ALTER TABLE "categories" ADD COLUMN "cash_envelope" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "to_repay" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "repaid_on" date;--> statement-breakpoint
-- Groceries, restaurant and transport: budgets taken out in cash by default.
UPDATE "categories" SET "cash_envelope" = true WHERE "key" IN ('groceries', 'restaurant', 'transport');
