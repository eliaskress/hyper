import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database (Engine model)...");

  // Clean existing data (reverse FK order)
  // New tables may not exist yet if migrations haven't run
  try { await db.delete(schema.creatorEngagements); } catch {}
  try { await db.delete(schema.campaignSequences); } catch {}
  try { await db.delete(schema.cascadeEvents); } catch {}
  await db.delete(schema.notifications);
  await db.delete(schema.propagationEvents);
  await db.delete(schema.referrals);
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
      email: "maria@demo.hyper.so",
      role: "influencer",
      handle: "maria.santos",
      avatar: null,
      followersCount: 47200,
      location: "Los Angeles, CA",
      neighborhood: "Los Angeles",
      referralCode: "MARIA-HYPER",
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
      email: "jake@demo.hyper.so",
      role: "influencer",
      handle: "jake.eats.la",
      avatar: null,
      followersCount: 23800,
      location: "Silver Lake, CA",
      neighborhood: "Silver Lake",
      referralCode: "JAKE-HYPER",
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
      email: "sofia@demo.hyper.so",
      role: "influencer",
      handle: "sofia.bites",
      avatar: null,
      followersCount: 81500,
      location: "Santa Monica, CA",
      neighborhood: "Santa Monica",
      referralCode: "SOFIA-HYPER",
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
      email: "bacio@demo.hyper.so",
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

  // ── Time references ──────────────────────────────────────────────
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

  // ── Additional Restaurants (for Open Collabs variety) ─────────────
  const newRestaurants = [
    { uid: "00000000-0000-0000-0000-000000000020", igId: "demo_nobu_official", handle: "nobu.la", bid: "00000000-0000-0000-0000-000000000110", name: "Nobu Los Angeles", ig: "nobula", addr: "3835 Cross Creek Rd, Malibu, CA 90265", bfId: "00000000-0000-0000-0000-000000003010", brief: "Capture the omakase experience. Film a Reel showing the presentation, the first bite reaction, the ambiance. Tag @nobula.", offer: "Omakase dinner for two, up to $200 value.", days: ["thursday", "friday", "saturday", "sunday"], meals: ["dinner"] as string[], responseHours: 48 },
    { uid: "00000000-0000-0000-0000-000000000021", igId: "demo_gjusta_official", handle: "gjusta", bid: "00000000-0000-0000-0000-000000000111", name: "Gjusta", ig: "gjusta", addr: "320 Sunset Ave, Venice, CA 90291", bfId: "00000000-0000-0000-0000-000000003011", brief: "Morning at Gjusta. Grab a pastry and a latte, find a spot on the patio, and show the Venice morning energy. Story or Reel.", offer: "Breakfast for two, any items. Up to $45 value.", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], meals: ["breakfast"] as string[], responseHours: 72 },
    { uid: "00000000-0000-0000-0000-000000000022", igId: "demo_bestia_official", handle: "bestia.la", bid: "00000000-0000-0000-0000-000000000112", name: "Bestia", ig: "bestiala", addr: "2121 E 7th Pl, Los Angeles, CA 90021", bfId: "00000000-0000-0000-0000-000000003012", brief: "Date night at Bestia. Share the pasta course, the cocktails, the industrial-chic vibe. No scripts, just the real experience.", offer: "Dinner for two with drinks. Up to $150 value.", days: ["wednesday", "thursday", "friday", "saturday"], meals: ["dinner"] as string[], responseHours: 24 },
    { uid: "00000000-0000-0000-0000-000000000023", igId: "demo_joes_official", handle: "joes.pizza.la", bid: "00000000-0000-0000-0000-000000000113", name: "Joe's Pizza", ig: "joespizzala", addr: "111 Broadway, Santa Monica, CA 90401", bfId: "00000000-0000-0000-0000-000000003013", brief: "Classic slice, classic vibes. Grab a pepperoni, find a spot on the sidewalk, and capture why this is the best slice in LA.", offer: "Any two slices + drinks. Up to $20 value.", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], meals: ["lunch", "dinner"] as string[], responseHours: 72 },
    { uid: "00000000-0000-0000-0000-000000000024", igId: "demo_republique_official", handle: "republique.la", bid: "00000000-0000-0000-0000-000000000114", name: "Republique", ig: "republiquela", addr: "624 S La Brea Ave, Los Angeles, CA 90036", bfId: "00000000-0000-0000-0000-000000003014", brief: "Brunch at Republique. The pastries, the light, the crowd. Show why this is the brunch spot everyone needs to know.", offer: "Brunch for two with pastry board. Up to $80 value.", days: ["saturday", "sunday"], meals: ["breakfast", "lunch"] as string[], responseHours: 48 },
    { uid: "00000000-0000-0000-0000-000000000025", igId: "demo_howlin_official", handle: "howlinrays", bid: "00000000-0000-0000-0000-000000000115", name: "Howlin' Ray's", ig: "howlinrays", addr: "727 N Broadway, Los Angeles, CA 90012", bfId: "00000000-0000-0000-0000-000000003015", brief: "The hottest chicken in LA. Film the line, the anticipation, the first bite. Show the heat levels and your honest reaction.", offer: "Any sandwich combo + drink. Up to $25 value.", days: ["tuesday", "wednesday", "thursday", "friday", "saturday"], meals: ["lunch"] as string[], responseHours: 72 },
    { uid: "00000000-0000-0000-0000-000000000026", igId: "demo_guelaguetza_official", handle: "guelaguetza.la", bid: "00000000-0000-0000-0000-000000000116", name: "Guelaguetza", ig: "guelaguetzala", addr: "3014 W Olympic Blvd, Los Angeles, CA 90006", bfId: "00000000-0000-0000-0000-000000003016", brief: "Oaxacan food at its best. Order the mole negro, show the colors and textures, and tell the story of why this place matters.", offer: "Dinner for two with mole sampler. Up to $70 value.", days: ["thursday", "friday", "saturday", "sunday"], meals: ["dinner"] as string[], responseHours: 72 },
    { uid: "00000000-0000-0000-0000-000000000027", igId: "demo_pine_official", handle: "pine.and.crane", bid: "00000000-0000-0000-0000-000000000117", name: "Pine & Crane", ig: "pineandcrane", addr: "1521 Griffith Park Blvd, Los Angeles, CA 90026", bfId: "00000000-0000-0000-0000-000000003017", brief: "Taiwanese comfort food in Silver Lake. The dan dan noodles, the three cup chicken, the patio. Casual, real, delicious.", offer: "Lunch for two, any items. Up to $40 value.", days: ["monday", "tuesday", "wednesday", "thursday", "friday"], meals: ["lunch"] as string[], responseHours: 48 },
    { uid: "00000000-0000-0000-0000-000000000028", igId: "demo_horses_official", handle: "horses.la", bid: "00000000-0000-0000-0000-000000000118", name: "Horses", ig: "horsesla", addr: "7617 W Sunset Blvd, Los Angeles, CA 90046", bfId: "00000000-0000-0000-0000-000000003018", brief: "Dinner at Horses. Share the pastas, the natural wines, the Hollywood energy. Capture the room and the food in equal measure.", offer: "Dinner for two with wine pairing. Up to $180 value.", days: ["wednesday", "thursday", "friday", "saturday"], meals: ["dinner"] as string[], responseHours: 24 },
  ];

  for (const r of newRestaurants) {
    await db.insert(schema.users).values({
      id: r.uid, instagramId: r.igId, role: "brand", handle: r.handle, avatar: null, xp: 0, tier: "starter",
    });
    await db.insert(schema.brands).values({
      id: r.bid, userId: r.uid, businessName: r.name, instagramHandle: r.ig, address: r.addr, verified: true, whatsappConnected: true,
    });
    await db.insert(schema.briefings).values({
      id: r.bfId, brandId: r.bid, contentBrief: r.brief, offerDescription: r.offer,
      availabilityDays: r.days, availabilityMeals: r.meals,
      budgetHi: "40.00", budgetTypeField: "monthly", status: "active", hiDelivered: "0",
      responseHours: r.responseHours ?? 72,
    });
  }

  // 9 invited assignments for Maria (one per new restaurant)
  // Stagger creation times so due dates vary: some urgent, some fresh
  const openAssignmentIds = [
    "00000000-0000-0000-0000-000000004010",
    "00000000-0000-0000-0000-000000004011",
    "00000000-0000-0000-0000-000000004012",
    "00000000-0000-0000-0000-000000004013",
    "00000000-0000-0000-0000-000000004014",
    "00000000-0000-0000-0000-000000004015",
    "00000000-0000-0000-0000-000000004016",
    "00000000-0000-0000-0000-000000004017",
    "00000000-0000-0000-0000-000000004018",
  ];
  // Hours ago each match was created - gives a mix of urgent and fresh
  const hoursAgoCreated = [60, 48, 36, 24, 12, 6, 3, 1, 0];
  for (let i = 0; i < newRestaurants.length; i++) {
    const responseHours = newRestaurants[i].responseHours ?? 72;
    const createdAt = new Date(now.getTime() - hoursAgoCreated[i] * 60 * 60 * 1000);
    const responseDueAt = new Date(createdAt.getTime() + responseHours * 60 * 60 * 1000);
    await db.insert(schema.assignments).values({
      id: openAssignmentIds[i],
      briefingId: newRestaurants[i].bfId,
      creatorId: creatorUser.id,
      status: "invited",
      allocatedHi: `${(5 + Math.floor(i * 1.5)).toFixed(2)}`,
      role: "originator",
      responseDueAt,
      createdAt,
    });
  }

  // ── Assignments (Hyper-assigned, not creator-initiated) ───────────
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
  await db
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

  // Jake - scheduled upcoming visit for Bacio (5 days out)
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  await db.insert(schema.assignments).values({
    id: "00000000-0000-0000-0000-000000004009",
    briefingId: briefing1.id,
    creatorId: creator2.id,
    status: "scheduled",
    selectedPlatforms: ["instagram"],
    allocatedHi: "6.00",
    scheduledDate: inFiveDays,
    scheduleTypeField: "fixed",
    scheduleTimeStart: "12:00",
    scheduleTimeEnd: "13:30",
    role: "originator",
  });

  // Sofia  - invited for Sakura (hasn't accepted yet)
  await db.insert(schema.assignments).values({
    id: "00000000-0000-0000-0000-000000004006",
    briefingId: briefing3.id,
    creatorId: creator3.id,
    status: "invited",
    allocatedHi: "7.00",
    role: "originator",
    responseDueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
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
    responseDueAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
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

  // ── Open Briefings ───────────────────────────────────────────────
  await db.insert(schema.briefings).values({
    id: "00000000-0000-0000-0000-000000003004",
    brandId: taqueria.id,
    contentBrief: "Weekend brunch special - show off our new chilaquiles plate. Casual vibe, natural light, tag us.",
    offerDescription: "Free brunch for two, any items. Up to $40 value.",
    availabilityDays: ["saturday", "sunday"],
    availabilityMeals: ["lunch"],
    budgetHi: "25.00",
    budgetTypeField: "per_engagement",
    status: "active",
    visibility: "open",
    hiDelivered: "0",
  });

  await db.insert(schema.briefings).values({
    id: "00000000-0000-0000-0000-000000003005",
    brandId: sakura.id,
    contentBrief: "Late night ramen run. Capture the cozy atmosphere, the steam, the first bite. Tag @sakuraramenhouse.",
    offerDescription: "Free ramen + appetizer for one. Up to $30 value.",
    availabilityDays: ["thursday", "friday", "saturday"],
    availabilityMeals: ["dinner"],
    budgetHi: "20.00",
    budgetTypeField: "per_engagement",
    status: "active",
    visibility: "open",
    hiDelivered: "0",
  });

  // ── Referrals ──────────────────────────────────────────────────
  const referralExpiry = new Date();
  referralExpiry.setMonth(referralExpiry.getMonth() + 24);

  await db.insert(schema.referrals).values({
    referrerId: creatorUser.id,
    referredId: creator2.id,
    referralCode: "MARIA-HYPER",
    createdAt: threeWeeksAgo,
    expiresAt: referralExpiry,
  });

  // ── Propagation Events ─────────────────────────────────────────
  // Get post IDs for reference (Maria's Bacio post = assignment1, Maria's Taqueria post = assignment2)
  const [mariaBacioPost] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(eq(schema.posts.assignmentId, assignment1.id));

  const [mariaTaqueriaPost] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(eq(schema.posts.assignmentId, assignment2.id));

  // Jake amplified Maria's Bacio post (+3.2 HI)
  await db.insert(schema.propagationEvents).values({
    type: "amplification",
    sourceCreatorId: creator2.id,
    targetCreatorId: creatorUser.id,
    sourcePostId: mariaBacioPost.id,
    briefingId: briefing1.id,
    hiAmount: "3.20",
    createdAt: fiveDaysAgo,
  });

  // Sofia amplified Maria's Taqueria post (+2.8 HI)
  await db.insert(schema.propagationEvents).values({
    type: "amplification",
    sourceCreatorId: creator3.id,
    targetCreatorId: creatorUser.id,
    sourcePostId: mariaTaqueriaPost.id,
    briefingId: briefing2.id,
    hiAmount: "2.80",
    createdAt: twoDaysAgo,
  });

  // Sofia amplified Jake's Bacio post (+2.16 HI)
  const [jakeBacioPost] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(eq(schema.posts.assignmentId, assignment4.id));

  await db.insert(schema.propagationEvents).values({
    type: "amplification",
    sourceCreatorId: creator3.id,
    targetCreatorId: creator2.id,
    sourcePostId: jakeBacioPost.id,
    briefingId: briefing1.id,
    hiAmount: "2.16",
    createdAt: new Date(fiveDaysAgo.getTime() + 12 * 60 * 60 * 1000),
  });

  // Maria amplified Jake's Bacio post (+2.16 HI)
  await db.insert(schema.propagationEvents).values({
    type: "amplification",
    sourceCreatorId: creatorUser.id,
    targetCreatorId: creator2.id,
    sourcePostId: jakeBacioPost.id,
    briefingId: briefing1.id,
    hiAmount: "2.16",
    createdAt: new Date(fiveDaysAgo.getTime() + 18 * 60 * 60 * 1000),
  });

  // Referral HI: Jake -> Maria (network reward from Jake's activity)
  await db.insert(schema.propagationEvents).values({
    type: "referral_hi",
    sourceCreatorId: creator2.id,
    targetCreatorId: creatorUser.id,
    briefingId: briefing1.id,
    hiAmount: "2.16",
    createdAt: fiveDaysAgo,
  });

  // ── Notifications ──────────────────────────────────────────────
  await db.insert(schema.notifications).values({
    userId: creatorUser.id,
    type: "amplification_received",
    title: "Jake amplified your Bacio post",
    body: "jake.eats.la amplified your Bacio di Latte post. You earned +3.2 HI from this amplification.",
    metadata: { postId: mariaBacioPost.id, amplifierHandle: "jake.eats.la", hi: 3.2 },
    read: false,
    createdAt: fiveDaysAgo,
  });

  await db.insert(schema.notifications).values({
    userId: creatorUser.id,
    type: "new_opportunity",
    title: "New open campaign: Taqueria Sunrise",
    body: "Taqueria Sunrise posted an open campaign. Weekend brunch special - check it out in your Collabs tab.",
    metadata: { briefingId: "00000000-0000-0000-0000-000000003004" },
    read: false,
    createdAt: twoDaysAgo,
  });

  await db.insert(schema.notifications).values({
    userId: creatorUser.id,
    type: "campaign_update",
    title: "Your post for Bacio has been measured",
    body: "Your Bacio di Latte post scored 9.9 HI. Payout of $39.60 is on the way.",
    metadata: { assignmentId: assignment1.id, hi: 9.9, payout: 39.60 },
    read: true,
    createdAt: oneWeekAgo,
  });

  // ── Admin User ───────────────────────────────────────────────
  await db.insert(schema.users).values({
    id: "00000000-0000-0000-0000-000000000099",
    instagramId: "admin_hyper",
    role: "admin",
    handle: "hyper.admin",
    avatar: null,
    xp: 0,
    tier: "starter",
  });

  // ── Cascade Events (for CCR demo) ──────────────────────────
  // Jake's Bacio post was triggered by Maria's Bacio post (posted ~2 days later)
  // Maria posted oneWeekAgo, Jake posted fiveDaysAgo = ~48h gap
  await db.insert(schema.cascadeEvents).values({
    sourcePostId: mariaBacioPost.id,
    triggeredPostId: jakeBacioPost.id,
    brandId: bacio.id,
    hoursElapsed: 48,
    detectionMethod: "auto",
    detectedAt: new Date(fiveDaysAgo.getTime() + 24 * 60 * 60 * 1000),
  });

  // Mark Maria's Bacio post as cascade trigger, Jake's as triggered
  await db.update(schema.posts)
    .set({ cascadeTriggered: true })
    .where(eq(schema.posts.id, mariaBacioPost.id));
  await db.update(schema.posts)
    .set({ cascadeSourceId: mariaBacioPost.id })
    .where(eq(schema.posts.id, jakeBacioPost.id));

  // Maria's Taqueria post triggered Jake's Taqueria post
  const [jakeTaqueriaPost] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(eq(schema.posts.assignmentId, assignment5.id));

  await db.insert(schema.cascadeEvents).values({
    sourcePostId: mariaTaqueriaPost.id,
    triggeredPostId: jakeTaqueriaPost.id,
    brandId: taqueria.id,
    hoursElapsed: 24,
    detectionMethod: "auto",
    detectedAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  await db.update(schema.posts)
    .set({ cascadeTriggered: true })
    .where(eq(schema.posts.id, mariaTaqueriaPost.id));
  await db.update(schema.posts)
    .set({ cascadeSourceId: mariaTaqueriaPost.id })
    .where(eq(schema.posts.id, jakeTaqueriaPost.id));

  // ── Campaign Sequences ─────────────────────────────────────
  // Bacio: first briefing at 50 HI
  await db.insert(schema.campaignSequences).values({
    brandId: bacio.id,
    briefingId: briefing1.id,
    sequenceNumber: 1,
    budgetHiUnits: "50.00",
    budgetIncreased: false,
    createdAt: threeWeeksAgo,
  });

  // Taqueria: first briefing at 30 HI
  await db.insert(schema.campaignSequences).values({
    brandId: taqueria.id,
    briefingId: briefing2.id,
    sequenceNumber: 1,
    budgetHiUnits: "30.00",
    budgetIncreased: false,
    createdAt: threeWeeksAgo,
  });

  // Taqueria: second briefing (open one) at 25 HI - did not increase
  await db.insert(schema.campaignSequences).values({
    brandId: taqueria.id,
    briefingId: "00000000-0000-0000-0000-000000003004",
    sequenceNumber: 2,
    budgetHiUnits: "25.00",
    budgetIncreased: false,
    createdAt: twoDaysAgo,
  });

  // Sakura: first briefing at 20 HI
  await db.insert(schema.campaignSequences).values({
    brandId: sakura.id,
    briefingId: briefing3.id,
    sequenceNumber: 1,
    budgetHiUnits: "20.00",
    budgetIncreased: false,
    createdAt: threeWeeksAgo,
  });

  // ── Creator Engagements ────────────────────────────────────
  // Maria: 2 completed collabs (Bacio paid, Taqueria measured)
  await db.insert(schema.creatorEngagements).values({
    creatorId: creatorUser.id,
    briefingId: briefing1.id,
    brandId: bacio.id,
    engagementNumber: 1,
    completedAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });
  await db.insert(schema.creatorEngagements).values({
    creatorId: creatorUser.id,
    briefingId: briefing2.id,
    brandId: taqueria.id,
    engagementNumber: 2,
    completedAt: fiveDaysAgo,
  });

  // Jake: 2 completed collabs (Bacio paid, Taqueria paid)
  await db.insert(schema.creatorEngagements).values({
    creatorId: creator2.id,
    briefingId: briefing1.id,
    brandId: bacio.id,
    engagementNumber: 1,
    completedAt: new Date(fiveDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });
  await db.insert(schema.creatorEngagements).values({
    creatorId: creator2.id,
    briefingId: briefing2.id,
    brandId: taqueria.id,
    engagementNumber: 2,
    completedAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
  });

  // Sofia: 1 collab (Bacio posted, not yet completed/measured)
  // Not added here since she hasn't completed yet

  console.log("Seed complete (Engine model v0.9)!");
  console.log("  - 7 users (3 creators, 3 restaurants, 1 admin)");
  console.log("  - 3 restaurants (2 WhatsApp connected)");
  console.log("  - 5 briefings (3 invited, 2 open)");
  console.log("  - 9 assignments (various lifecycle stages)");
  console.log("  - 5 posts (with real HI metrics, 2 cascade triggers)");
  console.log("  - 4 payouts (HI-based, 40% creator share)");
  console.log("  - 3 badges");
  console.log("  - 1 referral (Maria referred Jake)");
  console.log("  - 5 propagation events (4 amplifications, 1 referral_hi)");
  console.log("  - 3 notifications");
  console.log("  - 2 cascade events (Bacio + Taqueria)");
  console.log("  - 4 campaign sequences (3 brands)");
  console.log("  - 4 creator engagements (Maria 2x, Jake 2x)");
}

seed().catch(console.error);
