import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");

  // Clean existing data (reverse FK order)
  await db.delete(schema.badges);
  await db.delete(schema.payouts);
  await db.delete(schema.applications);
  await db.delete(schema.campaigns);
  await db.delete(schema.brands);
  await db.delete(schema.users);

  // ── Demo Users ────────────────────────────────────────────────────
  const [creatorUser] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000001",
      instagramId: "demo_maria_santos",
      role: "influencer",
      handle: "maria.santos",
      avatar: null,
      xp: 320,
      tier: "rising",
    })
    .returning();

  const [creator2] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000002",
      instagramId: "demo_jake_food",
      role: "influencer",
      handle: "jake.eats.la",
      avatar: null,
      xp: 150,
      tier: "rising",
    })
    .returning();

  const [creator3] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000003",
      instagramId: "demo_sofia_bites",
      role: "influencer",
      handle: "sofia.bites",
      avatar: null,
      xp: 45,
      tier: "starter",
    })
    .returning();

  const [brandUser] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000010",
      instagramId: "demo_bacio_official",
      role: "brand",
      handle: "bacio.di.latte",
      avatar: null,
      xp: 0,
      tier: "starter",
    })
    .returning();

  const [brandUser2] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000011",
      instagramId: "demo_taqueria_official",
      role: "brand",
      handle: "taqueria.sunrise",
      avatar: null,
      xp: 0,
      tier: "starter",
    })
    .returning();

  const [brandUser3] = await db
    .insert(schema.users)
    .values({
      id: "00000000-0000-0000-0000-000000000012",
      instagramId: "demo_sakura_official",
      role: "brand",
      handle: "sakura.ramen",
      avatar: null,
      xp: 0,
      tier: "starter",
    })
    .returning();

  // ── Brands (Restaurants) ──────────────────────────────────────────
  const [bacio] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000100",
      userId: brandUser.id,
      businessName: "Bacio di Latte",
      verified: true,
    })
    .returning();

  const [taqueria] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000101",
      userId: brandUser2.id,
      businessName: "Taqueria Sunrise",
      verified: true,
    })
    .returning();

  const [sakura] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000102",
      userId: brandUser3.id,
      businessName: "Sakura Ramen House",
      verified: false,
    })
    .returning();

  // ── Campaigns ─────────────────────────────────────────────────────
  const now = new Date();
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const [campaign1] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001001",
      brandId: bacio.id,
      title: "Summer Gelato Launch",
      description: "Post a Reel or Story featuring our new summer gelato flavors. Tag @baciodilatte and use #BacioSummer. Show the vibe — outdoor seating, friends, golden hour.",
      payout: "120.00",
      status: "active",
      deadline: inOneWeek,
    })
    .returning();

  const [campaign2] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001002",
      brandId: taqueria.id,
      title: "Taco Tuesday Spotlight",
      description: "Come in on Tuesday, grab our signature Al Pastor tacos, and post about it. Authentic vibes only — no scripted content. Just show people what makes our tacos worth the trip.",
      payout: "75.00",
      status: "active",
      deadline: inTwoWeeks,
    })
    .returning();

  const [campaign3] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001003",
      brandId: sakura.id,
      title: "Ramen Date Night",
      description: "Bring someone special, order the tonkotsu, and capture the moment. We want cozy, real, delicious content. Story or Reel, your choice.",
      payout: "90.00",
      status: "active",
      deadline: inOneWeek,
    })
    .returning();

  const [campaign4] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001004",
      brandId: bacio.id,
      title: "Weekend Brunch Feature",
      description: "Visit us Saturday or Sunday morning. Capture the brunch menu, the coffee, the atmosphere. This is about making people wish they were here.",
      payout: "60.00",
      status: "completed",
      deadline: twoDaysAgo,
    })
    .returning();

  // ── Applications ──────────────────────────────────────────────────
  // Maria applied and was accepted for campaign1
  await db.insert(schema.applications).values({
    id: "00000000-0000-0000-0000-000000002001",
    campaignId: campaign1.id,
    influencerId: creatorUser.id,
    status: "accepted",
  });

  // Jake applied for campaign2
  await db.insert(schema.applications).values({
    id: "00000000-0000-0000-0000-000000002002",
    campaignId: campaign2.id,
    influencerId: creator2.id,
    status: "applied",
  });

  // Maria completed campaign4 and got paid
  const [paidApp] = await db
    .insert(schema.applications)
    .values({
      id: "00000000-0000-0000-0000-000000002003",
      campaignId: campaign4.id,
      influencerId: creatorUser.id,
      status: "paid",
      postUrl: "https://instagram.com/p/demo_post_123",
    })
    .returning();

  // Sofia applied for campaign3
  await db.insert(schema.applications).values({
    id: "00000000-0000-0000-0000-000000002004",
    campaignId: campaign3.id,
    influencerId: creator3.id,
    status: "applied",
  });

  // Jake applied for campaign1 too
  await db.insert(schema.applications).values({
    id: "00000000-0000-0000-0000-000000002005",
    campaignId: campaign1.id,
    influencerId: creator2.id,
    status: "applied",
  });

  // ── Payouts ───────────────────────────────────────────────────────
  await db.insert(schema.payouts).values({
    applicationId: paidApp.id,
    amount: "60.00",
    stripeTransferId: "tr_demo_001",
    paidAt: twoDaysAgo,
  });

  // ── Badges ────────────────────────────────────────────────────────
  await db.insert(schema.badges).values({
    userId: creatorUser.id,
    badgeType: "first_campaign",
  });

  await db.insert(schema.badges).values({
    userId: brandUser.id,
    badgeType: "fast_responder",
  });

  console.log("Seed complete!");
  console.log("  - 6 users (3 creators, 3 restaurants)");
  console.log("  - 3 restaurants");
  console.log("  - 4 campaigns (3 active, 1 completed)");
  console.log("  - 5 applications");
  console.log("  - 1 payout");
  console.log("  - 2 badges");
}

seed().catch(console.error);
