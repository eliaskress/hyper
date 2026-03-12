import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database (Engine model)...");

  // Clean existing data (reverse FK order)
  await db.delete(schema.badges);
  await db.delete(schema.payouts);
  await db.delete(schema.posts);
  await db.delete(schema.assignments);
  await db.delete(schema.briefings);
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
      higScore: 72,
      primaryPlatform: "instagram",
      platforms: ["https://instagram.com/maria.santos", "https://tiktok.com/@maria.santos"],
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
      higScore: 58,
      primaryPlatform: "instagram",
      platforms: ["https://instagram.com/jake.eats.la"],
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
      higScore: 41,
      primaryPlatform: "instagram",
      platforms: ["https://instagram.com/sofia.bites", "https://youtube.com/@sofiabites"],
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
      instagramHandle: "baciodilatte",
      address: "8906 Melrose Ave, West Hollywood, CA 90069",
      verified: true,
      whatsappConnected: true,
    })
    .returning();

  const [taqueria] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000101",
      userId: brandUser2.id,
      businessName: "Taqueria Sunrise",
      instagramHandle: "taqueriasunrise",
      address: "3101 W Sunset Blvd, Silver Lake, CA 90029",
      verified: true,
      whatsappConnected: true,
    })
    .returning();

  const [sakura] = await db
    .insert(schema.brands)
    .values({
      id: "00000000-0000-0000-0000-000000000102",
      userId: brandUser3.id,
      businessName: "Sakura Ramen House",
      instagramHandle: "sakuraramenhouse",
      address: "1234 Sawtelle Blvd, Los Angeles, CA 90025",
      verified: false,
      whatsappConnected: false,
    })
    .returning();

  // ── Briefings (one per restaurant) ────────────────────────────────
  const [briefing1] = await db
    .insert(schema.briefings)
    .values({
      id: "00000000-0000-0000-0000-000000003001",
      brandId: bacio.id,
      contentBrief: "Post a Reel or Story featuring our gelato. Show the vibe  - outdoor seating, friends, golden hour. Tag @baciodilatte.",
      offerDescription: "Free gelato for two (any flavors) + two drinks. Up to $35 value.",
      availabilityDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      availabilityMeals: ["lunch", "dinner"],
      budgetHi: "50.00",
      budgetTypeField: "monthly",
      status: "active",
      hiDelivered: "17.10",
    })
    .returning();

  const [briefing2] = await db
    .insert(schema.briefings)
    .values({
      id: "00000000-0000-0000-0000-000000003002",
      brandId: taqueria.id,
      contentBrief: "Grab our signature Al Pastor tacos and post about it. Authentic vibes only  - no scripted content. Show what makes our tacos worth the trip.",
      offerDescription: "Free meal for one  - any taco plate + drink. Up to $25 value.",
      availabilityDays: ["tuesday", "thursday", "friday", "saturday"],
      availabilityMeals: ["lunch", "dinner"],
      budgetHi: "30.00",
      budgetTypeField: "per_engagement",
      status: "active",
      hiDelivered: "12.60",
    })
    .returning();

  const [briefing3] = await db
    .insert(schema.briefings)
    .values({
      id: "00000000-0000-0000-0000-000000003003",
      brandId: sakura.id,
      contentBrief: "Bring someone special, order the tonkotsu, and capture the moment. Cozy, real, delicious content. Story or Reel, your choice.",
      offerDescription: "Dinner for two on us  - ramen, appetizer, and drinks. Up to $60 value.",
      availabilityDays: ["friday", "saturday", "sunday"],
      availabilityMeals: ["dinner"],
      budgetHi: "20.00",
      budgetTypeField: "per_engagement",
      status: "active",
      hiDelivered: "0",
    })
    .returning();

  // ── Assignments (Hyper-assigned, not creator-initiated) ───────────
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

  // Maria  - paid assignment for Bacio (completed full cycle)
  const [assignment1] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004001",
      briefingId: briefing1.id,
      creatorId: creatorUser.id,
      status: "paid",
      selectedPlatforms: ["instagram"],
      allocatedHi: "8.50",
      scheduledDate: oneWeekAgo,
      scheduleTypeField: "flexible",
      scheduleTimeStart: "12:00",
      scheduleTimeEnd: "15:00",
      role: "originator",
    })
    .returning();

  // Maria  - measured assignment for Taqueria (awaiting payout)
  const [assignment2] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004002",
      briefingId: briefing2.id,
      creatorId: creatorUser.id,
      status: "measured",
      selectedPlatforms: ["instagram", "tiktok"],
      allocatedHi: "6.00",
      scheduledDate: fiveDaysAgo,
      scheduleTypeField: "fixed",
      scheduleTimeStart: "18:00",
      scheduleTimeEnd: "19:00",
      role: "originator",
    })
    .returning();

  // Maria  - scheduled upcoming visit for Bacio
  const [assignment3] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004003",
      briefingId: briefing1.id,
      creatorId: creatorUser.id,
      status: "scheduled",
      selectedPlatforms: ["instagram", "tiktok"],
      allocatedHi: "8.00",
      scheduledDate: inThreeDays,
      scheduleTypeField: "flexible",
      scheduleTimeStart: "11:00",
      scheduleTimeEnd: "14:00",
      role: "originator",
    })
    .returning();

  // Jake  - paid assignment for Bacio (completed)
  const [assignment4] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004004",
      briefingId: briefing1.id,
      creatorId: creator2.id,
      status: "paid",
      selectedPlatforms: ["instagram"],
      allocatedHi: "5.50",
      scheduledDate: fiveDaysAgo,
      scheduleTypeField: "fixed",
      scheduleTimeStart: "13:00",
      scheduleTimeEnd: "14:00",
      role: "originator",
    })
    .returning();

  // Jake  - paid assignment for Taqueria
  const [assignment5] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004005",
      briefingId: briefing2.id,
      creatorId: creator2.id,
      status: "paid",
      selectedPlatforms: ["instagram"],
      allocatedHi: "6.60",
      scheduledDate: oneWeekAgo,
      scheduleTypeField: "fixed",
      scheduleTimeStart: "12:30",
      scheduleTimeEnd: "13:30",
      role: "originator",
    })
    .returning();

  // Sofia  - invited for Sakura (hasn't accepted yet)
  await db.insert(schema.assignments).values({
    id: "00000000-0000-0000-0000-000000004006",
    briefingId: briefing3.id,
    creatorId: creator3.id,
    status: "invited",
    allocatedHi: "7.00",
    role: "originator",
  });

  // Sofia  - posted for Bacio (awaiting measurement)
  const [assignment7] = await db
    .insert(schema.assignments)
    .values({
      id: "00000000-0000-0000-0000-000000004007",
      briefingId: briefing1.id,
      creatorId: creator3.id,
      status: "posted",
      selectedPlatforms: ["instagram"],
      allocatedHi: "9.00",
      scheduledDate: twoDaysAgo,
      scheduleTypeField: "flexible",
      scheduleTimeStart: "17:00",
      scheduleTimeEnd: "20:00",
      role: "originator",
    })
    .returning();

  // Maria  - invited for Sakura
  await db.insert(schema.assignments).values({
    id: "00000000-0000-0000-0000-000000004008",
    briefingId: briefing3.id,
    creatorId: creatorUser.id,
    status: "invited",
    allocatedHi: "6.00",
    role: "originator",
  });

  // ── Posts (for completed/measured assignments) ────────────────────
  // Maria's post for Bacio (measured + paid)
  await db.insert(schema.posts).values({
    assignmentId: assignment1.id,
    platform: "instagram",
    postUrl: "https://instagram.com/p/demo_maria_bacio_1",
    likes: 2840,
    comments: 187,
    saves: 94,
    shares: 42,
    reach: 18200,
    hiCalculated: "9.90",
    postedAt: oneWeekAgo,
    measuredAt: new Date(oneWeekAgo.getTime() + 24 * 60 * 60 * 1000),
  });

  // Maria's post for Taqueria (measured, awaiting payout)
  await db.insert(schema.posts).values({
    assignmentId: assignment2.id,
    platform: "instagram",
    postUrl: "https://instagram.com/p/demo_maria_taqueria_1",
    likes: 1650,
    comments: 98,
    saves: 56,
    shares: 31,
    reach: 12400,
    hiCalculated: "8.50",
    postedAt: oneWeekAgo,
    measuredAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  // Jake's post for Taqueria (measured + paid)
  await db.insert(schema.posts).values({
    assignmentId: assignment5.id,
    platform: "instagram",
    postUrl: "https://instagram.com/p/demo_jake_taqueria_1",
    likes: 1120,
    comments: 65,
    saves: 38,
    shares: 22,
    reach: 9800,
    hiCalculated: "6.60",
    postedAt: oneWeekAgo,
    measuredAt: new Date(oneWeekAgo.getTime() + 24 * 60 * 60 * 1000),
  });

  // Jake's post for Bacio (measured + paid)
  await db.insert(schema.posts).values({
    assignmentId: assignment4.id,
    platform: "instagram",
    postUrl: "https://instagram.com/p/demo_jake_bacio_1",
    likes: 1540,
    comments: 112,
    saves: 67,
    shares: 29,
    reach: 11500,
    hiCalculated: "7.20",
    postedAt: fiveDaysAgo,
    measuredAt: new Date(fiveDaysAgo.getTime() + 24 * 60 * 60 * 1000),
  });

  // Sofia's post for Bacio (posted, not yet measured)
  await db.insert(schema.posts).values({
    assignmentId: assignment7.id,
    platform: "instagram",
    postUrl: "https://instagram.com/p/demo_sofia_bacio_1",
    likes: null,
    comments: null,
    saves: null,
    shares: null,
    reach: null,
    hiCalculated: null,
    postedAt: twoDaysAgo,
    measuredAt: null,
  });

  // ── Payouts ───────────────────────────────────────────────────────
  // Maria paid for Bacio assignment (9.90 HI × $4/HI creator share = $39.60)
  await db.insert(schema.payouts).values({
    assignmentId: assignment1.id,
    amount: "39.60",
    hiAmount: "9.90",
    status: "paid",
    stripeTransferId: "tr_demo_001",
    paidAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  // Jake paid for Bacio assignment (7.20 HI × $4/HI creator share = $28.80)
  await db.insert(schema.payouts).values({
    assignmentId: assignment4.id,
    amount: "28.80",
    hiAmount: "7.20",
    status: "paid",
    stripeTransferId: "tr_demo_003",
    paidAt: new Date(fiveDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  // Maria pending payout for Taqueria (8.50 HI × $4 = $34.00)
  await db.insert(schema.payouts).values({
    assignmentId: assignment2.id,
    amount: "34.00",
    hiAmount: "8.50",
    status: "pending",
    stripeTransferId: null,
    paidAt: null,
  });

  // Jake paid for Taqueria (6.60 HI × $4 = $26.40)
  await db.insert(schema.payouts).values({
    assignmentId: assignment5.id,
    amount: "26.40",
    hiAmount: "6.60",
    status: "paid",
    stripeTransferId: "tr_demo_002",
    paidAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  // ── Badges ────────────────────────────────────────────────────────
  await db.insert(schema.badges).values({
    userId: creatorUser.id,
    badgeType: "first_campaign",
  });

  await db.insert(schema.badges).values({
    userId: creatorUser.id,
    badgeType: "on_time_creator",
  });

  await db.insert(schema.badges).values({
    userId: brandUser.id,
    badgeType: "fast_responder",
  });

  console.log("Seed complete (Engine model)!");
  console.log("  - 6 users (3 creators, 3 restaurants)");
  console.log("  - 3 restaurants (2 WhatsApp connected)");
  console.log("  - 3 briefings (one per restaurant)");
  console.log("  - 8 assignments (various lifecycle stages)");
  console.log("  - 4 posts (with real HI metrics)");
  console.log("  - 3 payouts (HI-based, 40% creator share)");
  console.log("  - 3 badges");
}

seed().catch(console.error);
