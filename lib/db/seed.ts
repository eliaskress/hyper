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
      followersCount: 47200,
      location: "Los Angeles, CA",
      stripeAccountId: null,
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
      followersCount: 23800,
      location: "Silver Lake, CA",
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
      followersCount: 81500,
      location: "Santa Monica, CA",
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
      address: "8906 Melrose Ave, West Hollywood, CA 90069",
      verified: true,
    })
    .returning();

  const [taqueria] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000101",
      userId: brandUser2.id,
      businessName: "Taqueria Sunrise",
      address: "3101 W Sunset Blvd, Silver Lake, CA 90029",
      verified: true,
    })
    .returning();

  const [sakura] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000102",
      userId: brandUser3.id,
      businessName: "Sakura Ramen House",
      address: "1234 Sawtelle Blvd, Los Angeles, CA 90025",
      verified: false,
    })
    .returning();

  // ── Campaigns ─────────────────────────────────────────────────────
  const now = new Date();
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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

  // Past completed campaigns for Maria's earnings history
  const [campaign5] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001005",
      brandId: taqueria.id,
      title: "Happy Hour Promo",
      description: "Come try our new happy hour menu and post about the experience.",
      payout: "85.00",
      status: "completed",
      deadline: oneWeekAgo,
    })
    .returning();

  const [campaign6] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001006",
      brandId: sakura.id,
      title: "Lunch Special Feature",
      description: "Showcase our $12 bento lunch special to your followers.",
      payout: "50.00",
      status: "completed",
      deadline: twoWeeksAgo,
    })
    .returning();

  const [campaign7] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001007",
      brandId: bacio.id,
      title: "Valentine Dessert Drop",
      description: "Feature our limited-edition Valentine dessert collection.",
      payout: "150.00",
      status: "completed",
      deadline: threeWeeksAgo,
    })
    .returning();

  const [campaign8] = await db
    .insert(schema.campaigns)
    .values({
      id: "00000000-0000-0000-0000-000000001008",
      brandId: taqueria.id,
      title: "Grand Opening Weekend",
      description: "Help us launch our second location with some buzz.",
      payout: "200.00",
      status: "completed",
      deadline: oneMonthAgo,
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

  // Maria applied for campaign2 (still pending)
  await db.insert(schema.applications).values({
    id: "00000000-0000-0000-0000-000000002010",
    campaignId: campaign2.id,
    influencerId: creatorUser.id,
    status: "applied",
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

  // Maria completed campaign5 (Happy Hour Promo)
  const [paidApp2] = await db
    .insert(schema.applications)
    .values({
      id: "00000000-0000-0000-0000-000000002006",
      campaignId: campaign5.id,
      influencerId: creatorUser.id,
      status: "paid",
      postUrl: "https://instagram.com/p/demo_post_happy_hour",
      submittedAt: oneWeekAgo,
    })
    .returning();

  // Maria completed campaign6 (Lunch Special)
  const [paidApp3] = await db
    .insert(schema.applications)
    .values({
      id: "00000000-0000-0000-0000-000000002007",
      campaignId: campaign6.id,
      influencerId: creatorUser.id,
      status: "paid",
      postUrl: "https://instagram.com/p/demo_post_bento",
      submittedAt: twoWeeksAgo,
    })
    .returning();

  // Maria completed campaign7 (Valentine Dessert)
  const [paidApp4] = await db
    .insert(schema.applications)
    .values({
      id: "00000000-0000-0000-0000-000000002008",
      campaignId: campaign7.id,
      influencerId: creatorUser.id,
      status: "paid",
      postUrl: "https://instagram.com/p/demo_post_valentine",
      submittedAt: threeWeeksAgo,
    })
    .returning();

  // Maria completed campaign8 (Grand Opening)
  const [paidApp5] = await db
    .insert(schema.applications)
    .values({
      id: "00000000-0000-0000-0000-000000002009",
      campaignId: campaign8.id,
      influencerId: creatorUser.id,
      status: "paid",
      postUrl: "https://instagram.com/p/demo_post_opening",
      submittedAt: oneMonthAgo,
    })
    .returning();

  // ── Payouts ───────────────────────────────────────────────────────
  // Pending payout (most recent — waiting for Stripe transfer)
  await db.insert(schema.payouts).values({
    applicationId: paidApp.id,
    amount: "60.00",
    status: "pending",
    stripeTransferId: null,
    paidAt: null,
  });

  // Paid payouts
  await db.insert(schema.payouts).values({
    applicationId: paidApp2.id,
    amount: "85.00",
    status: "paid",
    stripeTransferId: "tr_demo_002",
    paidAt: oneWeekAgo,
  });

  await db.insert(schema.payouts).values({
    applicationId: paidApp3.id,
    amount: "50.00",
    status: "paid",
    stripeTransferId: "tr_demo_003",
    paidAt: twoWeeksAgo,
  });

  await db.insert(schema.payouts).values({
    applicationId: paidApp4.id,
    amount: "150.00",
    status: "paid",
    stripeTransferId: "tr_demo_004",
    paidAt: threeWeeksAgo,
  });

  await db.insert(schema.payouts).values({
    applicationId: paidApp5.id,
    amount: "200.00",
    status: "paid",
    stripeTransferId: "tr_demo_005",
    paidAt: oneMonthAgo,
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
  console.log("  - 8 campaigns (3 active, 5 completed)");
  console.log("  - 9 applications");
  console.log("  - 5 payouts (Maria earned $545 total)");
  console.log("  - 2 badges");
}

seed().catch(console.error);
