# PROGRESS.md  - Hyper

## Current Version: v0.5.0 - Collabs, Referrals, Polish

---

## Changelog

### v0.5.0 - Collabs, Referrals, Polish (2026-03-11)

**What shipped:**

Naming and navigation cleanup, creator referral system, dashboard improvements.

**Collabs rename:**
- "Posts" renamed to "Collabs" across brand dashboard (nav tab, page title, URL)
- Route moved from `/brand/creators` to `/brand/collabs`
- Collabs page uses mock data with per-platform cards (IG + TikTok from same assignment show as separate collabs)

**Creator referrals:**
- New `/creator/referrals` page with QR code, referral link, copy/share buttons
- Earnings preview table showing 25% revenue share for 2 years
- Empty state for referred creators list
- New "Referrals" tab in creator bottom nav (5 tabs total)

**Creator dashboard:**
- Hero metrics reordered: Earned (green), Total Collabs, Upcoming, Total HI with tooltip
- Green color variant added to StatCard
- Shared HiTooltip component (`components/ui/hi-tooltip.tsx`)
- `upcomingAssignments` (invited + accepted + scheduled) added to getCreatorStats query

**Copy cleanup:**
- All em dashes and en dashes removed from every file (copy, comments, code)
- No-em-dash rule added to CLAUDE.md
- Unicode en dash `\u2013` replaced with hyphens in schedule display

---

### v0.2.0  - Engine Overhaul (2026-03-11)

**What shipped:**

Mental model shift from two-sided marketplace to AI-operated influence engine. Restaurants don't browse creators. Creators don't browse campaigns. Hyper handles everything.

**Schema:**
- Replaced `campaigns` with `briefings` (one per restaurant, questionnaire-based)
- Replaced `applications` with `assignments` (Hyper-assigned, not creator-initiated)
- Added `posts` table (platform, postUrl, metrics, hiCalculated)
- New enums: `assignmentStatus` (invited/accepted/scheduled/posted/measured/paid/declined), `budgetType`, `scheduleType`
- Added `instagramHandle` to brands, `higScore`/`platforms` to users
- Assignment lifecycle: Matched → Accepted → Scheduled → Posted → Measured → Paid

**Restaurant experience:**
- Single briefing view (content brief, availability days/meals, HI budget)
- Campaign status dashboard with HI progress bar
- Matched creators page (read-only  - Hyper decides, no accept/decline)
- Reports page with HI hero card + engagement breakdown (likes, comments, saves, shares, reach)
- Instagram connection on profile (editable)
- Payment plan / subscription model (replaces Stripe Connect)
- No creator payment transparency anywhere in brand experience
- WhatsApp connection indicator + message previews throughout

**Creator experience:**
- Assignment-based home (no browsing, no applications)
- Full assignment detail: accept/decline (reason required), schedule visit (date + mealtime constrained to restaurant availability), submit post link
- Assignment list grouped by lifecycle status
- Earnings tied to HI measurement ($4/HI creator share)
- HIG score display on profile

**Components:**
- `HiDisplay`, `HiEarnings`, `HiBudget`  - standardized HI unit display
- `WhatsAppPreview`, `WhatsAppIndicator`  - chat bubble mockups
- `StatusBadge` updated with assignment statuses ("invited" displays as "matched")
- Bottom nav: Brand 5 tabs (Home/Briefing/Creators/Reports/Profile), Creator 4 tabs (Home/Assignments/Earnings/Profile)

**API:**
- `PATCH /api/assignments`  - accept, decline (with reason), schedule (date + mealtime)
- `POST /api/assignments/post`  - submit Instagram post link, moves to "posted"
- `PATCH /api/brands/profile`  - update Instagram handle
- Zod validation with regex UUID (RFC-compliant `.uuid()` rejected seed data)
- Middleware updated to allow all `/api/` routes through password gate

**Infrastructure:**
- Seed data: 3 creators (HIG 72/58/41), 3 restaurants, 3 briefings, 8 assignments across all lifecycle stages, 4 posts with metrics, 3 payouts
- WhatsApp message templates stub (`lib/whatsapp/`)
- Vercel preview deployment working (DATABASE_URL env var fixed)
- Onboarding requires Instagram handle for both roles

**Deleted:**
- `/brand/campaigns/`, `/brand/applications/`, `/brand/applicant/`, `/brand/payouts/`
- `/influencer/browse/`, `/influencer/applications/`
- `/api/applications/`, `/api/campaigns/`

---

### v0.1.0  - Project Skeleton (2026-03-11)

**What shipped:**

- Next.js App Router with TypeScript + Tailwind CSS
- Drizzle ORM schema, Auth.js v5, route protection middleware
- Dashboard page stubs, API route stubs, UI primitives
- HI calculation module with PRD formula, pricing constants, revenue split
- Security headers, GitHub Actions CI, Neon DB connection
- CLAUDE.md, SOUL.md, DESIGN_PRINCIPLES.md

---

## What's Stubbed (Not Implemented)

- Auth (demo mode with hardcoded user IDs, no real OAuth)
- Stripe (payment plan buttons are visual only)
- Instagram API (no real profile/media fetch)
- WhatsApp Business API (visual stubs only, no actual messaging)
- AI agent orchestration
- HI measurement from real posts (manual seed data only)
- Metrics extraction from analytics screenshots
- Campaign creation form (restaurant questionnaire → briefing via API)
- Gamification (XP grants, badge checks)

---

## What's Next

### v0.3.0  - Polish & Real Data Flow

- [ ] Restaurant onboarding questionnaire (IG handle → content brief → availability → budget)
- [ ] Real-time assignment status updates (optimistic UI)
- [ ] Post verification flow (link submission → 7-day wait → screenshot request)
- [ ] HI calculation from submitted post metrics
- [ ] Creator earnings page tied to real payout data

### v0.4.0  - Payments

- [ ] Stripe Checkout for restaurant subscription/budget plans
- [ ] Stripe Connect Express for creator payouts
- [ ] Payout calculation with 40/40/20 split
- [ ] Network referral payout logic (10/10, 24-month cap)

### v0.5.0  - WhatsApp Integration

- [ ] WhatsApp Business API setup
- [ ] Creator onboarding flow via WhatsApp
- [ ] Assignment invitation/reminder messages
- [ ] Screenshot collection flow
- [ ] Weekly report delivery to restaurants

### v0.6.0  - AI Agents

- [ ] Campaign Architect Agent
- [ ] Campaign Allocation Agent (HIG-based matching)
- [ ] Creator Operations Agent
- [ ] Metrics Extraction Agent (Claude vision for screenshots)
- [ ] Reporting Agent
- [ ] Payout & Ledger Agent

### v1.0.0  - Pilot Launch (LA)

- [ ] 20 restaurants, 50 creators
- [ ] End-to-end campaign flow working
- [ ] QR code generation for restaurant locations
- [ ] Amplification mechanics live
- [ ] First Influence Graph dataset generated

---

## Known Issues

- `drizzle-kit push` requires `DATABASE_URL_UNPOOLED` exported manually
- Vercel env vars must be set via CLI to avoid formatting issues (psql prefix, quotes)
- Zod `.uuid()` rejects zero-padded seed UUIDs  - using regex validation instead
- Vercel deployment protection (SSO) sits on top of password gate  - must be logged into Vercel to access preview

---

## Branch State

| Branch | Status | Notes |
|---|---|---|
| `main` | v0.1.0 skeleton | Protected, PRs only |
| `dev` | v0.2.0 engine overhaul | Auto-deploys to Vercel preview |
