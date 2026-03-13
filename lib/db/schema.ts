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
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRole = pgEnum('user_role', ['brand', 'influencer', 'admin']);

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

export const propagationType = pgEnum('propagation_type', [
  'amplification',
  'referral_hi',
  'network_boost',
]);

export const notificationType = pgEnum('notification_type', [
  'new_opportunity',
  'amplification_received',
  'milestone',
  'payout_ready',
  'campaign_update',
  'rank_change',
]);

export const briefingVisibility = pgEnum('briefing_visibility', [
  'invited',
  'open',
]);

export const detectionMethod = pgEnum('detection_method', ['auto', 'manual']);

// ── Tables ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  instagramId: varchar('instagram_id').unique().notNull(),
  email: varchar('email'),
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
  neighborhood: varchar('neighborhood'),
  referralCode: varchar('referral_code').unique(),
  emailPreferences: jsonb('email_preferences').$type<{
    newMatches: boolean;
    expiringMatches: boolean;
    dailyDigest: boolean;
    paymentReceived: boolean;
    creatorPosted: boolean;
    hiMeasured: boolean;
    weeklySummary: boolean;
  }>(),
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
  visibility: briefingVisibility('visibility').default('invited').notNull(),
  responseHours: integer('response_hours').default(72).notNull(),
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
  responseDueAt: timestamp('response_due_at'),
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
  cascadeTriggered: boolean('cascade_triggered').default(false).notNull(),
  cascadeSourceId: uuid('cascade_source_id'),
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

export const propagationEvents = pgTable('propagation_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: propagationType('type').notNull(),
  sourcePostId: uuid('source_post_id').references(() => posts.id),
  sourceCreatorId: uuid('source_creator_id')
    .references(() => users.id)
    .notNull(),
  targetCreatorId: uuid('target_creator_id')
    .references(() => users.id)
    .notNull(),
  briefingId: uuid('briefing_id').references(() => briefings.id),
  hiAmount: numeric('hi_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id')
    .references(() => users.id)
    .notNull(),
  referredId: uuid('referred_id')
    .references(() => users.id)
    .notNull(),
  referralCode: varchar('referral_code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: notificationType('type').notNull(),
  title: varchar('title').notNull(),
  body: text('body').notNull(),
  metadata: jsonb('metadata'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Launch Metrics Tables ─────────────────────────────────────────────────────

export const cascadeEvents = pgTable('cascade_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourcePostId: uuid('source_post_id')
    .references(() => posts.id)
    .notNull(),
  triggeredPostId: uuid('triggered_post_id')
    .references(() => posts.id)
    .notNull(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  hoursElapsed: doublePrecision('hours_elapsed').notNull(),
  detectionMethod: detectionMethod('detection_method').default('auto').notNull(),
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
}, (table) => [
  index('idx_cascade_events_brand').on(table.brandId, table.detectedAt),
]);

export const campaignSequences = pgTable('campaign_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  briefingId: uuid('briefing_id')
    .references(() => briefings.id)
    .notNull(),
  sequenceNumber: integer('sequence_number').notNull(),
  budgetHiUnits: numeric('budget_hi_units', { precision: 10, scale: 2 }).notNull(),
  budgetIncreased: boolean('budget_increased').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const creatorEngagements = pgTable('creator_engagements', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .references(() => users.id)
    .notNull(),
  briefingId: uuid('briefing_id')
    .references(() => briefings.id)
    .notNull(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  engagementNumber: integer('engagement_number').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
}, (table) => [
  index('idx_creator_engagements_creator').on(table.creatorId, table.completedAt),
]);
