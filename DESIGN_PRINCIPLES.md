# DESIGN_PRINCIPLES.md  - Hyper

## North Star

Every design decision in Hyper should make the answer to one question obvious:

**"What do I do next?"**

If a user has to think about that for more than a second, something needs to change.

---

## Two Core Principles

### Fluidity

A fluid application is one where the user never feels lost, idle, or forced to think about what to do next. The system continuously guides the user through the natural lifecycle of the product.

- Every screen should lead naturally to the next action
- Users should never hit a dead end or empty state without a clear path forward
- The product lifecycle should feel like movement, not isolated dashboards

### Coherence

A coherent application is one where every screen reinforces the same underlying concept and mental model. For Hyper, that concept is **influence propagation**.

Every part of the product must reinforce the same loop:

1. Restaurant launches campaign
2. Creator generates content
3. Influence spreads
4. HI is measured
5. Earnings and ROI are produced
6. More influence is generated

- Creators should feel they are **operating an influence engine**
- Restaurants should feel they are **watching influence spread through their neighborhood**

---

## The Five Principles

### 1. One Job Per Screen
Every screen in Hyper has one primary action. Not two. Not a row of options. One.

- The campaign browse screen's job: find a campaign worth applying to.
- The campaign detail screen's job: decide whether to apply.
- The payout screen's job: confirm bank info and get paid.

Secondary information exists to support that one job, never to compete with it. If content doesn't serve the primary action, it doesn't belong on that screen.

### 2. Progress Is Always Visible
Users should always know where they are in any process. Campaign lifecycle, application status, payout status  - all of it should be legible at a glance without clicking into anything.

This applies to:
- Campaign status (Draft → Active → In Review → Completed)
- Application status (Applied → Accepted → Content Submitted → Paid)
- Onboarding completeness (always show what's missing and why it matters)
- HIG score progress (always show the gap between current score and next tier)

Never make users wonder if something happened. Confirm every action explicitly.

### 3. Speed Over Completeness
Hyper is used on mobile, on the go, in between other things. Design for the person who has 90 seconds, not the person who has 20 minutes.

- Campaign cards must communicate the essentials without opening: restaurant name, payout, content type, deadline.
- Applications should be submittable in under 2 minutes.
- Dashboard should load the most important information first, above the fold, always.
- Prefer progressive disclosure: show the essential, reveal the detail on demand.

Avoid: long forms with many fields on one screen, required reading before action, wall-of-text descriptions.

### 4. Earn Trust Through Transparency
Both sides of every deal are trusting Hyper with their time and money. Design should reinforce that trust, not exploit it.

- Show real payout amounts everywhere  - no hidden fees revealed at checkout.
- Surface the 40/40/20 revenue split clearly in merchant campaign creation, not as fine print.
- Show creator HIG score and completion rate before a merchant commits.
- Show merchant verification status before a creator applies.
- Never use dark patterns: no pre-checked boxes, no fake scarcity, no confusing cancellation flows.

### 5. Delight Is in the Details
Hyper's core experience should be fast and functional. But the details  - the micro-animations, the copy in empty states, the confetti when a payout hits  - those make it feel alive.

Delight should be:
- **Earned**  - triggered by real moments (first payout, 10th campaign, first repeat booking)
- **Brief**  - never blocking or demanding attention
- **Honest**  - reflects something real the user accomplished, not a manufactured milestone

Avoid: animations that slow things down, achievement popups that interrupt workflows, notifications that don't require action.

---

## Visual Direction

### Aesthetic
Hyper is modern, confident, and grounded. Not corporate. Not pastel startup. Not streetwear hype. Think: clean type, bold color accents, generous whitespace, photography-forward.

It should feel like something a 26-year-old creator would actually want on their phone, and that a restaurant owner would feel is serious enough to trust with their money.

### Color
- **Primary:** A bold, saturated accent (electric blue or deep violet  - to be finalized in design system)
- **Neutral base:** Near-black backgrounds for dark mode, clean white for light mode
- **Success:** Green  - for completed, paid, verified states
- **Warning:** Amber  - for pending, awaiting action states
- **Error:** Red  - used sparingly, only for real errors

Color should carry meaning. Don't use the primary accent for decoration.

### Typography
- One typeface family throughout (sans-serif, legible at small sizes)
- Type hierarchy is strict: there should never be more than 3 text sizes on one screen
- Numbers  - payouts, follower counts, HI, HIG scores  - should be visually prominent. Make the money feel real.

### Iconography
- Use icons to reinforce meaning, never to replace labels
- All icons should have text labels on key actions (especially on mobile)
- Consistent icon set; no mixing styles

### Spacing
- Generous internal padding on cards and list items  - nothing feels cramped
- Consistent spacing scale (8pt grid)
- Touch targets minimum 44x44pt

---

## Mobile-First Standards

Hyper is primarily a mobile experience.

- Design for 390px wide (iPhone 14) as the base
- All primary actions reachable with one thumb
- No horizontal scrolling on core screens
- Bottom navigation for the five main sections (not a hamburger menu)
- Modals and sheets used for focused tasks, not full navigation

---

## Gamification Design

### HIG (Hyper Influence Graph) Score
Each creator receives a HIG score (0-100) that determines campaign allocation priority. HIG is the primary reputation metric  - it replaces traditional XP systems.

HIG components:

| Component | Weight |
|---|---|
| HI performance | 50% |
| Amplification effectiveness | 20% |
| Reliability | 20% |
| Network contribution | 10% |

Higher HIG = priority access to higher-budget campaigns. HIG should feel like earned credibility, not a gamified treadmill.

Merchants also have a trust score that improves with successful campaigns, fair reviews, and on-time payment.

### Badges
Badges are specific, earned for real actions, and displayed on profiles to build trust between parties.

Examples:
- "Fast Responder"  - responds to applications within 24hr (merchant)
- "On-Time Creator"  - submits content before deadline (creator)
- "Repeat Partner"  - booked by same merchant 3+ times (creator)
- "Local Champion"  - 10 campaigns completed in the same city

Badges should mean something to the other side of the deal  - they're signals of reliability, not vanity points.

### Notifications and Progress
- HIG score progress should be visible on the dashboard  - always show the gap
- Payout milestones surfaced as moments: "$500 total earned. You're building real income."
- Campaign completion triggers a summary card: HI generated, earnings breakdown, badge progress

---

## Empty States

Empty states are a design opportunity. Never show a blank screen.

Every empty state should:
1. Acknowledge the situation honestly
2. Tell the user why it's empty (no campaigns yet vs. no matches vs. no applications yet)
3. Give them one clear thing to do about it

Examples:
- No campaigns available: "Nothing matching right now. New campaigns post daily  - check back or adjust your filters."
- No applications yet (merchant): "No one's applied yet. Share your campaign to get more eyes on it."
- New user dashboard: "You're all set. Browse campaigns and find your first one."

---

## Accessibility

- WCAG AA compliance minimum
- All color combinations pass 4.5:1 contrast ratio
- All interactive elements keyboard navigable
- Images and icons have descriptive alt text
- Forms have visible labels (never placeholder-only)
- Error messages explain what went wrong and how to fix it

---

## What We Don't Build

These patterns are explicitly off-limits:

- **Infinite scroll on campaign lists**  - paginate with clear control. Users should be able to find their place.
- **Auto-playing video**  - never without user intent
- **Notification spam**  - only notify for actions that require a response
- **Forced social sharing**  - achievements can be shared, never required to claim
- **Dark mode paywalls**  - don't hide core functionality behind upgrade prompts mid-task
- **Fake review systems**  - ratings must be earned from real completed campaigns only
