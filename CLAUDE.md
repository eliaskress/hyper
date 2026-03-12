# CLAUDE.md  - Hyper

## What Hyper Is

Hyper is an AI-operated influence network that connects restaurants with local micro-creators for paid marketing campaigns. Creators post content about a restaurant, Hyper measures the impact using a proprietary metric called HI (Hyper Influence)  - a weighted engagement formula combining reach and engagement signals  - and everyone gets paid based on verified influence generated.

The primary interface is WhatsApp. Creators join through a WhatsApp onboarding flow, verify their social profiles, and manage campaigns conversationally. Restaurants onboard the same way. The web dashboard (this codebase) is the secondary management interface and admin view.

A set of AI agents handle the operational workflow end-to-end: onboarding, campaign design, creator allocation, metrics extraction, reporting, and payout preparation. Deterministic code  - not agents  - handles financial logic: HI calculation, payout math, and referral eligibility.

Hyper launches in **Los Angeles** with 20 restaurants and 50 creators. The goal is fast execution, clean data capture, reliable HI measurement, and a repeatable campaign flow.

The long-term moat is the **Influence Graph**  - a foundational dataset mapping how influence propagates across creators, audiences, and merchants.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, React 19) |
| Database | Neon DB (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (demo: Credentials provider; prod: Instagram/TikTok/YouTube OAuth) |
| Hosting | Vercel (frontend/API) |
| Payments | Stripe Connect |
| Messaging | WhatsApp Business API (not yet implemented) |
| AI | Claude (primary), ChatGPT (QA/fallback) |
| CI | GitHub Actions (lint, type-check, npm audit) |

---

## Branching & Deployments

| Branch | Environment | URL |
|---|---|---|
| `dev` | Staging | Vercel preview (auto-deploys on push) |
| `main` | Production | Vercel production (protected, requires PR) |

- `feature/[name]` and `fix/[name]` branch off `dev`
- PRs always merge to `dev` first
- `dev` → `main` is a deliberate release
- Branch protection on `main`: require PR reviews, no direct pushes
- Staging is password-gated (`hubster999`) via middleware

---

## Repository Structure

```
hyper/
├── app/
│   ├── (auth)/login/           # Role selection (Creator / Restaurant)
│   ├── (dashboard)/
│   │   ├── brand/              # Restaurant dashboard
│   │   │   ├── campaigns/      # Campaign list + detail + applicant review
│   │   │   ├── applications/   # All applications across campaigns
│   │   │   ├── applicant/[id]/ # Creator profile view (for review)
│   │   │   ├── payouts/        # Payout tracking (stub)
│   │   │   └── profile/        # Business profile (stub)
│   │   └── influencer/         # Creator dashboard
│   │       ├── browse/         # Campaign discovery + detail
│   │       ├── applications/   # Application history
│   │       ├── earnings/       # Payout history with statuses
│   │       └── profile/        # Creator profile (info + Stripe tabs)
│   ├── api/
│   │   ├── applications/       # PATCH accept/reject applications
│   │   ├── gate/               # Password gate authentication
│   │   └── webhooks/           # Stripe, Instagram webhooks (stubs)
│   └── gate/                   # Password entry page
├── components/ui/              # Card, StatCard, StatusBadge, Button, BottomNav
├── lib/
│   ├── db/                     # Schema, queries, seed data
│   ├── hi/                     # HI calculation, HIG scoring, revenue split
│   ├── stripe/                 # Stripe Connect helpers (stubs)
│   ├── instagram/              # Instagram API helpers (stubs)
│   └── gamification/           # XP grants, badge checks (stubs)
├── middleware.ts                # Password gate for staging
├── drizzle.config.ts
└── .env.local                  # Local secrets (never committed)
```

---

## Core Metric  - HI (Hyper Influence)

```
HI = 100 × (L + 2C + 6S + 8SH) / R
```

Where: L = Likes, C = Comments, S = Saves, SH = Shares, R = Reach (unique users, measured 24h after posting). If reach is missing, HI cannot be calculated.

### Pricing & Revenue Split

- **Price per HI:** $10
- **Revenue split:** 40% Hyper / 40% Creator / 20% Network
- **Network split:** 10% creator recruiter / 10% restaurant introducer
- **Network referral cap:** 24 months, no compounding

### Amplification

- Amplifier reward: 30% of original HI
- Max 5 amplifiers per post
- Amplification cannot exceed 50% of creator's own HI in campaign

### HIG (Hyper Influence Grade)

Creators are ranked 0-100, weighted by:
- HI performance (50%)
- Amplification effectiveness (20%)
- Reliability (20%)
- Network contribution (10%)

Higher HIG = priority access to better campaigns.

---

## Database Schema (Current)

6 tables, 6 enums. Schema defined in `lib/db/schema.ts`.

```
users          - uuid PK, instagram_id, role, handle, avatar, followers_count, location, stripe_account_id, xp, tier
brands         - uuid PK, user_id FK, business_name, address, verified, stripe_account_id
campaigns      - uuid PK, brand_id FK, title, description, payout, status, deadline
applications   - uuid PK, campaign_id FK, influencer_id FK, status, post_url, submitted_at
payouts        - uuid PK, application_id FK, amount, status (pending/paid/cancelled), stripe_transfer_id, paid_at
badges         - uuid PK, user_id FK, badge_type, earned_at
```

Enums: `user_role`, `user_tier`, `campaign_status`, `application_status`, `payout_status`, `badge_type`

**Note:** The PRD describes additional tables (posts, hi_ledger, amplifications, network_referrals, creators, restaurants) that are not yet implemented. Current schema supports the demo MVP.

---

## Current State (Demo MVP)

### What works:
- Password-gated landing page
- Role selection → Creator or Restaurant dashboard
- Creator: browse campaigns, view detail, see applications, earnings with payout statuses, full profile with IG/followers/Stripe tabs
- Restaurant: view campaigns, review applicants with profile cards (followers, location, IG link), accept/decline applications via API
- Seed data: 3 restaurants (LA locations), 3 creators, 8 campaigns, 10 applications, 5 payouts, 2 badges
- Demo uses hardcoded user IDs (no real auth)

### What's stubbed:
- Auth (Instagram/TikTok/YouTube OAuth)
- Stripe Connect (payment collection + payouts)
- Instagram API (profile/media fetch)
- WhatsApp Business API
- AI agent orchestration
- Campaign creation form
- HI measurement from real posts
- Gamification (XP grants, badge checks)

---

## Authentication (Current)

Auth is **disabled for demo mode**. The middleware only enforces the password gate.

- `auth.ts` has a Credentials provider for dev (`demo-login`) but it's not used in the current flow
- Login page uses direct `<Link>` navigation to `/influencer` and `/brand`
- Pages use hardcoded demo IDs: creator `00000000-0000-0000-0000-000000000001`, brand `00000000-0000-0000-0000-000000000100`

---

## Security

### Headers (next.config.ts)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### API
- Input validation with **Zod** on API request bodies
- Consistent error shape: `{ error: string, code: string }`
- Password gate cookie: httpOnly, secure in production, 30-day expiry

### GitHub
- CI on push/PR: lint, type-check, npm audit
- `.env.local` gitignored
- Environment variables in Vercel dashboard for deployments

---

## Environment Variables

```bash
# Neon DB
DATABASE_URL=           # pooled connection (app runtime)
DATABASE_URL_UNPOOLED=  # direct connection (migrations only)

# Auth (not active in demo)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe (not active in demo)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Development

```bash
npm install          # install deps
npm run dev          # local dev server
npm run lint         # eslint
npm run type-check   # tsc --noEmit
npm run db:seed      # seed demo data (needs DATABASE_URL)
npm run db:generate  # generate drizzle migrations
npm run db:migrate   # run migrations (needs DATABASE_URL_UNPOOLED)
npm run db:studio    # drizzle studio GUI
```

Seed script requires `DATABASE_URL` passed inline:
```bash
DATABASE_URL="postgresql://..." npx tsx lib/db/seed.ts
```

---

## AI Agent Architecture (Planned)

8 agents orchestrate Hyper operations (see PRD for full specs):

1. **Creator Onboarding Agent**  - WhatsApp-based creator signup
2. **Restaurant Onboarding Agent**  - WhatsApp-based merchant signup
3. **Campaign Architect Agent**  - structures campaign proposals
4. **Campaign Allocation Agent**  - allocates HI across creators by HIG score
5. **Creator Operations Agent**  - sends invitations, collects post links
6. **Metrics Extraction Agent**  - parses analytics screenshots for HI inputs
7. **Reporting Agent**  - generates WhatsApp-ready campaign summaries
8. **Payout & Ledger Agent**  - prepares payout breakdowns

Agents handle orchestration/extraction/messaging. **Deterministic code** handles: HI formula, payout math, referral eligibility, campaign status transitions.

---

## Voice & Design

- Direct, warm, action-oriented  - no corporate fluff, no fake urgency
- Gamification = recognition, not manipulation: real milestones, no streaks or leaderboards
- Every screen has one job. Progress is always visible.
- Mobile-first, built for someone with 90 seconds between other things
- Use "restaurant" or "merchant" for the business side, "creator" for the influencer side
- See `SOUL.md` for full brand voice guidelines
- See `DESIGN_PRINCIPLES.md` for UX principles

---

## Claude-Specific Notes

**IMPORTANT: Never read, search, or modify files outside of the `C:\Users\shuya\hyper\` directory. All work is scoped strictly to this project.**

- Always use the App Router pattern (no `pages/` directory)
- Prefer server components by default; use `"use client"` only when necessary
- Database queries belong in `lib/db/queries/`, never inline in components
- HI calculation and HIG scoring live in `lib/hi/`  - deterministic, never agent-computed
- **Never use em dashes (—) or en dashes (–) anywhere in copy, comments, or code.** Use hyphens (-), commas, periods, or colons instead.
- Keep it simple. Hyper's north star is ease of use.
