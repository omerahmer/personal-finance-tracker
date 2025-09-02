CREATE TYPE "public"."expense_type" AS ENUM('shopping', 'food', 'groceries', 'subscriptions', 'bills', 'services', 'payments');--> statement-breakpoint
CREATE TYPE "public"."statement_type" AS ENUM('applecard', 'chase', 'mastercard');--> statement-breakpoint
CREATE TABLE "balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp NOT NULL,
	"statementtype" "statement_type" NOT NULL,
	"balance" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"statementtype" "statement_type" NOT NULL,
	"expensetype" "expense_type" NOT NULL,
	"vendor" text NOT NULL,
	"price" numeric NOT NULL,
	"location" text NOT NULL
);
