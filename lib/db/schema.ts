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
  jsonb,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRole = pgEnum('user_role', ['brand', 'influencer']);

export const userTier = pgEnum('user_tier', [
  'starter',
  'rising',
  'established',
  'pro',
]);

export const briefingStatus = pgEnum('briefing_status', [
  'draft',
  'active',
  'paused',
  'completed',
]);

export const budgetType = pgEnum('budget_type', [
  'per_engagement',
  'monthly',
]);

export const assignmentStatus = pgEnum('assignment_status', [
  'invited',
  'accepted',
  'scheduled',
  'posted',
  'measured',
  'paid',
  'declined',
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

export const scheduleType = pgEnum('schedule_type', ['fixed', 'flexible']);

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
  higScore: integer('hig_score').default(0).notNull(),
  primaryPlatform: varchar('primary_platform').default('instagram'),
  platforms: jsonb('platforms').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique()
    .notNull(),
  businessName: varchar('business_name').notNull(),
  instagramHandle: varchar('instagram_handle'),
  address: text('address'),
  verified: boolean('verified').default(false).notNull(),
  stripeAccountId: varchar('stripe_account_id'),
  whatsappConnected: boolean('whatsapp_connected').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const briefings = pgTable('briefings', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  contentBrief: text('content_brief').notNull(),
  offerDescription: text('offer_description'),
  availabilityDays: jsonb('availability_days').$type<string[]>(),
  availabilityMeals: jsonb('availability_meals').$type<string[]>(),
  budgetHi: numeric('budget_hi', { precision: 10, scale: 2 }).notNull(),
  budgetTypeField: budgetType('budget_type').default('per_engagement').notNull(),
  status: briefingStatus('status').default('active').notNull(),
  hiDelivered: numeric('hi_delivered', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  briefingId: uuid('briefing_id')
    .references(() => briefings.id)
    .notNull(),
  creatorId: uuid('creator_id')
    .references(() => users.id)
    .notNull(),
  status: assignmentStatus('status').default('invited').notNull(),
  allocatedHi: numeric('allocated_hi', { precision: 10, scale: 2 }),
  scheduledDate: timestamp('scheduled_date'),
  scheduleTypeField: scheduleType('schedule_type'),
  scheduleTimeStart: varchar('schedule_time_start'),
  scheduleTimeEnd: varchar('schedule_time_end'),
  selectedPlatforms: jsonb('selected_platforms').$type<string[]>(),
  role: varchar('role').default('originator'),
  declineReason: text('decline_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id')
    .references(() => assignments.id)
    .notNull(),
  platform: varchar('platform').default('instagram').notNull(),
  postUrl: text('post_url'),
  likes: integer('likes'),
  comments: integer('comments'),
  saves: integer('saves'),
  shares: integer('shares'),
  reach: integer('reach'),
  hiCalculated: numeric('hi_calculated', { precision: 10, scale: 2 }),
  postedAt: timestamp('posted_at'),
  measuredAt: timestamp('measured_at'),
});

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignmentId: uuid('assignment_id')
    .references(() => assignments.id)
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  hiAmount: numeric('hi_amount', { precision: 10, scale: 2 }),
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
