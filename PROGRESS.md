# PROGRESS.md — Hyper

## Current Version: v0.1.0 — Skeleton

---

## Changelog

### v0.1.0 — Project Skeleton (2026-03-11)

**What shipped:**

- Next.js 14+ App Router with TypeScript + Tailwind CSS
- Drizzle ORM schema: 6 tables (users, brands, campaigns, applications, payouts, badges), 5 enums — migrated to Neon DB
- Auth.js v5 with Instagram OAuth stub and JWT session strategy
- Route protection middleware for `/dashboard/*` and `/api/*`
- 11 dashboard page stubs (6 brand, 5 influencer)
- 4 API route stubs (campaigns, applications, stripe webhook, instagram webhook)
- UI primitives: Button, Card, StatusBadge, EmptyState, BottomNav (role-aware)
- HI calculation module (`lib/hi/`) with PRD formula, pricing constants, revenue split, amplification rules, HIG weights
- Lib stubs: Stripe Connect, Instagram API, gamification
- Security headers (X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy)
- GitHub Actions CI pipeline (lint, type-check, audit)
- `.env.local` with live Neon DB connection
- GitHub repo: `eliaskress/hyper`, `main` + `dev` branches

**Doc alignment:**

- CLAUDE.md, SOUL.md, DESIGN_PRINCIPLES.md updated to match PRD as source of truth
- Terminology: "brand" → "merchant/restaurant", "influencer" → "creator"
- Gamification: XP/Tiers replaced with HIG scoring (0-100)
- Scope: narrowed to restaurants as launch vertical
- Interfaces: WhatsApp as primary, web dashboard as secondary
- Platforms: Instagram + TikTok + YouTube (not Instagram-only)
- Revenue split: 40% Hyper / 40% Creator / 20% Network

**What's stubbed (not implemented):**

- All API routes return 501
- Auth actually authenticates no one (Instagram OAuth creds are stubs)
- Stripe functions throw "not implemented"
- Instagram/TikTok/YouTube API helpers throw "not implemented"
- Gamification functions (grantXp, checkBadges) throw "not implemented"
- No WhatsApp integration yet
- No AI agent endpoints yet
- DB schema doesn't yet match expanded PRD tables (posts, amplifications, hi_ledger, network_referrals, creators, restaurants)

---

## What's Next

### v0.2.0 — Schema Expansion & Auth

- [ ] Expand DB schema to match PRD: add `creators`, `restaurants`, `posts`, `amplifications`, `hi_ledger`, `network_referrals` tables
- [ ] Rename `brands` → `restaurants`, update all references
- [ ] Wire up real Instagram OAuth (requires Meta app approval)
- [ ] Add dev-only Credentials provider for local testing
- [ ] Implement role selection flow (onboarding page → DB write)

### v0.3.0 — Campaign Flow (Web)

- [ ] Campaign CRUD API routes (create, list, get, update status)
- [ ] Application flow API routes (apply, accept, reject, submit content)
- [ ] Zod validation on all request bodies
- [ ] Wire dashboard pages to real data

### v0.4.0 — HI Measurement Pipeline

- [ ] Metrics extraction from analytics screenshots (Claude vision)
- [ ] Deterministic HI calculation service
- [ ] HIG scoring implementation
- [ ] Post verification flow (link submission → 24h wait → screenshot request)

### v0.5.0 — Payments

- [ ] Stripe Connect Express onboarding for creators
- [ ] Campaign payment (merchant → Hyper escrow)
- [ ] Payout calculation with 40/40/20 split
- [ ] Network referral payout logic (10/10, 24-month cap)
- [ ] Stripe webhook handlers

### v0.6.0 — WhatsApp Integration

- [ ] WhatsApp Business API setup
- [ ] Creator onboarding agent (Claude-powered)
- [ ] Restaurant onboarding agent
- [ ] Campaign invitation/reminder messages
- [ ] Screenshot collection flow

### v0.7.0 — AI Agents

- [ ] Campaign Architect Agent
- [ ] Campaign Allocation Agent
- [ ] Creator Operations Agent
- [ ] Metrics Extraction Agent
- [ ] Reporting Agent
- [ ] Payout & Ledger Agent

### v1.0.0 — Pilot Launch (LA)

- [ ] 20 restaurants, 50 creators
- [ ] End-to-end campaign flow working
- [ ] QR code generation for restaurant locations
- [ ] Amplification mechanics live
- [ ] First Influence Graph dataset generated

---

## Known Issues

- `claude.exe` is in the working directory but gitignored (too large for GitHub)
- `agents.md` is tracked in git but used by external coding agent — do not delete
- drizzle-kit requires `DATABASE_URL_UNPOOLED` set explicitly (doesn't read `.env.local` automatically)
- 11 ESLint warnings from unused stub parameters (intentional, will resolve as stubs are implemented)

---

## Branch State

| Branch | Status | Notes |
|---|---|---|
| `main` | v0.1.0 skeleton | Protected, PRs only |
| `dev` | v0.1.0 + doc alignment | Integration branch |
