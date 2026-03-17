# PROGRESS.md  - Hyper

## Current Version: v0.6.0 - Restaurant UX Overhaul + Email Notifications

---

## Changelog

### v0.6.0 - Restaurant UX Overhaul, Email Notifications, Influence Propagation (2026-03-16)

**What shipped:**

Complete restaurant dashboard overhaul shifting from campaign tracking to influence propagation. Email notification system. Creator match experience improvements.

**Restaurant dashboard overhaul:**
- Influence Spread hero card: creators posted, amplifications, secondary creators
- Monthly spend card with ROI estimates (reach + estimated visits)
- Trend Score card ("Rising in West Hollywood" with directional arrow)
- Creator Schedule: compact list of upcoming visits (day, date, handle, time)
- Quick links updated: Collabs renamed to Campaigns everywhere

**Campaigns page (full rewrite):**
- Creator Impact Ranking from real DB data (not mock)
- Hero stats: Total HI, Reach, Creators, Amplifications
- Ranked creator list with handle, neighborhood, HI, posts, amplifications
- IG/TikTok icons linking to creator profiles

**Reports:**
- Influence Propagation section (creators posted, amplifications, total reach)
- Blue background for Total HI displays
- Green background for Engagements (matching "earned" color)

**HI explanation:**
- Replaced raw formula with friendly text for restaurants
- Expandable "How HI works" revealing the formula (new client component)

**Profile:**
- Neighborhood coverage card (creator count + reach per neighborhood)
- Email preferences for both creator and brand profiles

**Briefing:**
- AI Brief Generator stub (vibe input, template-based brief generation)
- Static 72h response window note (removed configurability)

**Copy and navigation:**
- Landing headline: "Turn your influence into impact."
- Login: "I create influence" / "I run a restaurant" with subtitles
- Brand nav: Collabs renamed to Campaigns, route `/brand/campaigns`

**Creator experience:**
- New Matches as default tab (renamed from "Open Collabs")
- Red notification badges on tab + bottom nav for unviewed matches
- All matched cards link to detail view
- Due dates with countdown UI (red <6h, amber <24h, blue >24h)
- 72h default response window on all assignments

**Email notification system (Resend):**
- 10 email types with HTML templates (shared layout wrapper)
  - Creator: new match, expiring match, match accepted, daily digest, payment received
  - Restaurant: creator accepted, creator scheduled, creator posted, HI measured, weekly summary
- Lazy-initialized Resend client (builds without API key)
- Email preference toggles (JSONB on users table, per-role toggle sets)
- Preference checking before all sends (explicit false = skip)
- `POST /api/assignments/invite` - creates invited assignments with new match email
- Vercel cron: daily reminders at 8am PT, weekly summaries Monday 9am PT
- Non-blocking sends (fire-and-forget in API routes)

**New DB queries (5):**
- `getBriefingInfluenceSpread` - creators posted, amplifications, secondary creators, total reach
- `getBriefingCreatorRanking` - creators sorted by total HI with stats
- `getBriefingNeighborhoodCoverage` - neighborhood grouping with creator count and reach
- `getBrandCreatorSchedule` - upcoming visits (limit 7)
- `getBrandTrendScore` - neighborhood trend based on recent HI + amplifications

**Schema additions:**
- `users.email`, `users.emailPreferences` (JSONB)
- `briefings.responseHours` (default 72)
- `assignments.responseDueAt` (timestamp)

**Seed enrichment:**
- Additional propagation events for Bacio
- Scheduled assignment for Jake (5 days out)
- Demo email addresses on creator and brand users
- Staggered `createdAt` for due date variety

**Consolidated PRD:**
- `assets/HYPER_PRD.md` - single document merging all 4 source PDFs

**Design principles updated:**
- Fluidity: users never feel lost, idle, or forced to think
- Coherence: every screen reinforces influence propagation

---

### v0.5.0 - Collabs, Referrals, Polish (2026-03-11)

**What shipped:**

Naming and navigation cleanup, creator referral system, dashboard improvements.

- "Posts" renamed to "Collabs" across brand dashboard
- Creator referrals page with QR code, referral link, copy/share
- Creator dashboard hero metrics reordered (Earned green, Collabs, Upcoming, Total HI)
- Green color variant for StatCard
- All em dashes and en dashes removed project-wide

---

### v0.4.0 - Billing Model, Multi-Platform Posts, UI Overhaul (2026-03-11)

**What shipped:**

Billing model, multi-platform post support, UI improvements.

---

### v0.3.0 - Demo Lifecycle, Offers, Collabs Rebrand (2026-03-11)

**What shipped:**

Complete demo lifecycle, offer descriptions, collabs rebrand.

---

### v0.2.0 - Engine Overhaul (2026-03-11)

**What shipped:**

Mental model shift from two-sided marketplace to AI-operated influence engine.

- `campaigns` replaced with `briefings`, `applications` replaced with `assignments`
- Assignment lifecycle: Matched -> Accepted -> Scheduled -> Posted -> Measured -> Paid
- Restaurant: single briefing view, campaign status, matched creators, reports, WhatsApp stubs
- Creator: assignment-based flow, accept/decline, schedule, submit post
- HI display components, WhatsApp preview components, status badges
- Seed data: 3 creators, 3 restaurants, 3 briefings, 8 assignments, 4 posts, 3 payouts

---

### v0.1.0 - Project Skeleton (2026-03-11)

**What shipped:**

- Next.js App Router + TypeScript + Tailwind CSS
- Drizzle ORM schema, Auth.js v5, route protection middleware
- HI calculation module, pricing constants, revenue split
- Security headers, GitHub Actions CI, Neon DB connection
- CLAUDE.md, SOUL.md, DESIGN_PRINCIPLES.md

---

## What's Stubbed (Not Implemented)

- Auth (demo mode with hardcoded user IDs, no real OAuth)
- Stripe (payment buttons are visual only)
- Instagram API (no real profile/media fetch)
- WhatsApp Business API (visual stubs only)
- AI agent orchestration
- HI measurement from real posts (manual seed data only)
- Metrics extraction from analytics screenshots
- Gamification (XP grants, badge checks beyond seed data)
- Resend (API key not configured, emails log to console)
- Creator Drops feature
- Influence Map visualization
- Creator cluster system
- Open Opportunities / always-on influence

---

## What's Next

### v0.7.0 - Influence Visibility + Creator Engagement

- [ ] Influence screen for creators (HI generated, propagation, amplification opportunities, network stats)
- [ ] Open Opportunities section (restaurants rewarding influence without invitation)
- [ ] Amplification feed (other creators' posts you can amplify)
- [ ] Influence momentum on home screen ("Your influence this week: +6.4 HI")

### v0.8.0 - Payments

- [ ] Stripe Checkout for restaurant subscription/budget plans
- [ ] Stripe Connect Express for creator payouts
- [ ] Real payout execution with 40/40/20 split
- [ ] Network referral payout logic (10/10, 24-month cap)

### v0.9.0 - WhatsApp Integration

- [ ] WhatsApp Business API setup
- [ ] Creator onboarding flow via WhatsApp
- [ ] Assignment invitation/reminder messages
- [ ] Screenshot collection flow
- [ ] Weekly report delivery to restaurants

### v1.0.0 - Pilot Launch (LA)

- [ ] Real auth (Instagram/TikTok/YouTube OAuth)
- [ ] Resend configured with production domain
- [ ] 20 restaurants, 50 creators
- [ ] End-to-end campaign flow working
- [ ] QR code generation for restaurant locations
- [ ] Amplification mechanics live
- [ ] First Influence Graph dataset generated
- [ ] Market Formation Agents (creator + restaurant acquisition)

---

## Known Issues

- `drizzle-kit push` requires `DATABASE_URL_UNPOOLED` exported manually
- Vercel env vars must be set via CLI to avoid formatting issues
- Zod `.uuid()` rejects zero-padded seed UUIDs - using regex validation instead
- Vercel deployment protection (SSO) sits on top of password gate
- New DB tables from Sprint 2 (propagation_events, etc.) require manual SQL migration before seeding

---

## Branch State

| Branch | Status | Notes |
|---|---|---|
| `main` | v0.1.0 skeleton | Protected, PRs only |
| `dev` | v0.6.0 restaurant UX + email | Auto-deploys to Vercel preview |
