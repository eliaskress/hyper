import { relations } from 'drizzle-orm';
import {
  users,
  brands,
  briefings,
  assignments,
  posts,
  payouts,
  badges,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
  assignments: many(assignments),
  badges: many(badges),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  briefings: many(briefings),
}));

export const briefingsRelations = relations(briefings, ({ one, many }) => ({
  brand: one(brands, { fields: [briefings.brandId], references: [brands.id] }),
  assignments: many(assignments),
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

export const postsRelations = relations(posts, ({ one }) => ({
  assignment: one(assignments, {
    fields: [posts.assignmentId],
    references: [assignments.id],
  }),
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
