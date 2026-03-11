CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
ALTER TABLE "payouts" ADD COLUMN "status" "payout_status" DEFAULT 'pending' NOT NULL;