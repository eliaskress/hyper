# CLAUDE.md — Hyper

## Project Overview

Hyper is a marketplace network connecting local businesses with micro-influencers for paid marketing opportunities. Businesses post campaigns, influencers apply and complete them, and both sides get paid in real value — not sandwiches.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Database | Neon DB (serverless Postgres) |
| Auth | Instagram OAuth (via NextAuth.js) |
| Hosting | Vercel (recommended) |
| Version Control | GitHub |
| ORM | Drizzle ORM |
| Payments | Stripe Connect |

---

## Repository Structure

```
hyper/
├── app/                   # Next.js App Router
│   ├── (auth)/            # Auth routes (login, callback)
│   ├── (dashboard)/       # Protected routes
│   │   ├── brand/         # Brand-side views
│   │   └── influencer/    # Influencer-side views
│   ├── api/               # API route handlers
│   │   ├── auth/          # NextAuth handlers
│   │   ├── campaigns/     # Campaign CRUD
│   │   ├── applications/  # Application flow
│   │   └── webhooks/      # Stripe, Instagram webhooks
│   └── layout.tsx
├── components/            # Shared UI components
│   ├── ui/                # Primitives (buttons, cards, etc.)
│   ├── brand/             # Brand-specific components
│   └── influencer/        # Influencer-specific components
├── lib/
│   ├── db/                # Drizzle schema + queries
│   ├── auth/              # NextAuth config
│   ├── stripe/            # Stripe helpers
│   └── instagram/         # Instagram API helpers
├── middleware.ts           # Auth + security middleware
├── .env.local             # Local secrets (never committed)
└── drizzle.config.ts
```

---

## Authentication

- Auth is handled via **NextAuth.js** with the Instagram OAuth provider
- Sessions use **JWT strategy** with short expiry (15 min access, 7-day refresh)
- All `/dashboard` routes are protected by middleware
- On first login, users select a role: **Brand** or **Influencer**
- Role is stored in the database and locked after selection

```ts
// middleware.ts — protect all dashboard routes
export { default } from "next-auth/middleware"
export const config = { matcher: ["/dashboard/:path*", "/api/campaigns/:path*"] }
```

---

## Database (Neon)

- Use **Drizzle ORM** for type-safe queries
- All migrations tracked in `drizzle/migrations/`
- Use **connection pooling** via Neon's built-in pooler (not direct connections in serverless)
- Never expose raw DB credentials; use environment variables only

### Key Tables

```
users           — id, instagram_id, role, handle, avatar, xp, tier, created_at
brands          — id, user_id, business_name, verified, stripe_account_id
campaigns       — id, brand_id, title, description, payout, status, deadline
applications    — id, campaign_id, influencer_id, status, post_url, submitted_at
payouts         — id, application_id, amount, stripe_transfer_id, paid_at
badges          — id, user_id, badge_type, earned_at
```

---

## Security Standards

### Encryption
- **TLS 1.2+ enforced** for all in-transit data (Vercel handles this; verify in production)
- **Neon encrypts data at rest** by default (AES-256); confirm in Neon dashboard
- All environment variables stored in Vercel environment config, never in source

### API Security
- All API routes validate session server-side before any DB operation
- Input validation with **Zod** on all request bodies
- Rate limiting via Vercel's edge middleware or Upstash Ratelimit
- CSRF protection enabled via NextAuth's built-in handling
- No sensitive data returned in API responses (no passwords, no tokens, no full card data)

### Instagram OAuth
- Never store Instagram access tokens in the client
- Store encrypted tokens server-side in the DB (use `crypto` module or a secrets manager)
- Scope requests to minimum required: `user_profile`, `user_media`

### Headers
Set these in `next.config.js`:
```js
headers: [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]
```

### GitHub Practices
- Branch protection on `main`: require PR reviews, no direct pushes
- Use GitHub Actions for CI: lint, type-check, test before merge
- Use **GitHub Secrets** for all environment variables in CI/CD
- Run `npm audit` in CI pipeline
- Never commit `.env` files; `.env.local` is gitignored by default

---

## Environment Variables

```bash
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Instagram OAuth
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=

# Neon DB
DATABASE_URL=           # pooled connection
DATABASE_URL_UNPOOLED=  # direct for migrations only

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Development Workflow

```bash
# Install
npm install

# Run locally
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# DB migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Branch Strategy
- `main` — production only, protected
- `dev` — integration branch
- `feature/[name]` — individual features
- `fix/[name]` — bug fixes

PRs always merge to `dev` first. `dev` → `main` is a deliberate release.

---

## Payments (Stripe Connect)

- Brands pay into Hyper's Stripe account
- Influencers onboard via **Stripe Connect Express** for payouts
- Hyper takes a platform fee (defined in `lib/stripe/config.ts`)
- Escrow pattern: funds held until influencer post is verified, then released

---

## Error Handling

- Use `try/catch` in all API routes
- Return consistent error shapes: `{ error: string, code: string }`
- Log errors server-side (never expose stack traces to client)
- Use Sentry or Vercel's built-in error tracking in production

---

## Testing

- Unit tests: **Vitest**
- Integration tests: **Playwright** for critical flows (signup, campaign creation, payout)
- Test files colocated: `component.test.ts` next to `component.ts`
- CI runs all tests on PR

---

## Claude-Specific Notes

**IMPORTANT: Never read, search, or modify files outside of the `C:\Users\shuya\hyper\` directory. All work is scoped strictly to this project.**

When working in this codebase:
- Always use the App Router pattern (no `pages/` directory)
- Prefer server components by default; use `"use client"` only when necessary
- Database queries belong in `lib/db/queries/`, never inline in components
- All user-facing strings should be friendly and on-brand (see `soul.md`)
- Gamification logic lives in `lib/gamification/` — XP grants, badge checks, tier upgrades
- When in doubt, keep it simple. Hyper's north star is ease of use.
