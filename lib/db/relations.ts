import { relations } from 'drizzle-orm';
import {
  users,
  brands,
  campaigns,
  applications,
  payouts,
  badges,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
  applications: many(applications),
  badges: many(badges),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brands, { fields: [campaigns.brandId], references: [brands.id] }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [applications.campaignId],
    references: [campaigns.id],
  }),
  influencer: one(users, {
    fields: [applications.influencerId],
    references: [users.id],
  }),
  payout: one(payouts, {
    fields: [applications.id],
    references: [payouts.applicationId],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  application: one(applications, {
    fields: [payouts.applicationId],
    references: [applications.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, { fields: [badges.userId], references: [users.id] }),
}));
