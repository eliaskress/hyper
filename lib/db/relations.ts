import { relations } from 'drizzle-orm';
import {
  users,
  brands,
  briefings,
  assignments,
  posts,
  payouts,
  badges,
  propagationEvents,
  referrals,
  notifications,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
  assignments: many(assignments),
  badges: many(badges),
  notifications: many(notifications),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  referralsReceived: many(referrals, { relationName: 'referred' }),
  propagationsSent: many(propagationEvents, { relationName: 'sourceCreator' }),
  propagationsReceived: many(propagationEvents, { relationName: 'targetCreator' }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  briefings: many(briefings),
}));

export const briefingsRelations = relations(briefings, ({ one, many }) => ({
  brand: one(brands, { fields: [briefings.brandId], references: [brands.id] }),
  assignments: many(assignments),
  propagationEvents: many(propagationEvents),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  briefing: one(briefings, {
    fields: [assignments.briefingId],
    references: [briefings.id],
  }),
  creator: one(users, {
    fields: [assignments.creatorId],
    references: [users.id],
  }),
  posts: many(posts),
  payout: one(payouts, {
    fields: [assignments.id],
    references: [payouts.assignmentId],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [posts.assignmentId],
    references: [assignments.id],
  }),
  propagationEvents: many(propagationEvents),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  assignment: one(assignments, {
    fields: [payouts.assignmentId],
    references: [assignments.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, { fields: [badges.userId], references: [users.id] }),
}));

export const propagationEventsRelations = relations(propagationEvents, ({ one }) => ({
  sourcePost: one(posts, {
    fields: [propagationEvents.sourcePostId],
    references: [posts.id],
  }),
  sourceCreator: one(users, {
    fields: [propagationEvents.sourceCreatorId],
    references: [users.id],
    relationName: 'sourceCreator',
  }),
  targetCreator: one(users, {
    fields: [propagationEvents.targetCreatorId],
    references: [users.id],
    relationName: 'targetCreator',
  }),
  briefing: one(briefings, {
    fields: [propagationEvents.briefingId],
    references: [briefings.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: 'referred',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
