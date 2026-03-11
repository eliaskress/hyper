import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRole = pgEnum('user_role', ['brand', 'influencer']);

export const userTier = pgEnum('user_tier', [
  'starter',
  'rising',
  'established',
  'pro',
]);

export const campaignStatus = pgEnum('campaign_status', [
  'draft',
  'active',
  'in_review',
  'completed',
  'cancelled',
]);

export const applicationStatus = pgEnum('application_status', [
  'applied',
  'accepted',
  'content_submitted',
  'paid',
  'rejected',
]);

export const payoutStatus = pgEnum('payout_status', [
  'pending',
  'paid',
  'cancelled',
]);

export const badgeType = pgEnum('badge_type', [
  'fast_responder',
  'on_time_creator',
  'repeat_partner',
  'local_champion',
  'first_campaign',
  'payout_milestone',
]);

// ── Tables ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  instagramId: varchar('instagram_id').unique().notNull(),
  role: userRole('role'),
  handle: varchar('handle').notNull(),
  avatar: text('avatar'),
  followersCount: integer('followers_count'),
  location: varchar('location'),
  stripeAccountId: varchar('stripe_account_id'),
  xp: integer('xp').default(0).notNull(),
  tier: userTier('tier').default('starter').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique()
    .notNull(),
  businessName: varchar('business_name').notNull(),
  address: text('address'),
  verified: boolean('verified').default(false).notNull(),
  stripeAccountId: varchar('stripe_account_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  payout: numeric('payout', { precision: 10, scale: 2 }).notNull(),
  status: campaignStatus('status').default('draft').notNull(),
  deadline: timestamp('deadline').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id')
    .references(() => campaigns.id)
    .notNull(),
  influencerId: uuid('influencer_id')
    .references(() => users.id)
    .notNull(),
  status: applicationStatus('status').default('applied').notNull(),
  postUrl: text('post_url'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id')
    .references(() => applications.id)
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: payoutStatus('status').default('pending').notNull(),
  stripeTransferId: varchar('stripe_transfer_id'),
  paidAt: timestamp('paid_at'),
});

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  badgeType: badgeType('badge_type').notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
});
