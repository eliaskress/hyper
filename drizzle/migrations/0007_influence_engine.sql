-- v0.7 Influence Engine: new enums, tables, and column additions

-- New enums
CREATE TYPE "propagation_type" AS ENUM ('amplification', 'referral_hi', 'network_boost');
CREATE TYPE "notification_type" AS ENUM ('new_opportunity', 'amplification_received', 'milestone', 'payout_ready', 'campaign_update', 'rank_change');
CREATE TYPE "briefing_visibility" AS ENUM ('invited', 'open');

-- Column additions to existing tables
ALTER TABLE "users" ADD COLUMN "neighborhood" varchar;
ALTER TABLE "users" ADD COLUMN "referral_code" varchar UNIQUE;
ALTER TABLE "briefings" ADD COLUMN "visibility" "briefing_visibility" DEFAULT 'invited' NOT NULL;

-- New tables
CREATE TABLE IF NOT EXISTS "propagation_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "propagation_type" NOT NULL,
  "source_post_id" uuid REFERENCES "posts"("id"),
  "source_creator_id" uuid NOT NULL REFERENCES "users"("id"),
  "target_creator_id" uuid NOT NULL REFERENCES "users"("id"),
  "briefing_id" uuid REFERENCES "briefings"("id"),
  "hi_amount" numeric(10, 2) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "referrer_id" uuid NOT NULL REFERENCES "users"("id"),
  "referred_id" uuid NOT NULL REFERENCES "users"("id"),
  "referral_code" varchar NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "type" "notification_type" NOT NULL,
  "title" varchar NOT NULL,
  "body" text NOT NULL,
  "metadata" jsonb,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
