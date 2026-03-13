// Shared email layout wrapper
function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f8f9fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 32px 20px; }
    .card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb; }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #111; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 700; color: #111; margin: 0 0 8px; }
    h2 { font-size: 16px; font-weight: 600; color: #111; margin: 0 0 4px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.5; margin: 0 0 16px; }
    .highlight { background: #2563eb; color: #fff; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
    .highlight-value { font-size: 28px; font-weight: 800; color: #fff; }
    .highlight-label { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; }
    .btn { display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; }
    .btn-blue { background: #2563eb; }
    .item { border-bottom: 1px solid #f3f4f6; padding: 12px 0; }
    .item:last-child { border-bottom: none; }
    .item-name { font-size: 14px; font-weight: 600; color: #111; }
    .item-detail { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .badge-urgent { background: #fef2f2; color: #dc2626; }
    .badge-warning { background: #fffbeb; color: #d97706; }
    .badge-blue { background: #eff6ff; color: #2563eb; }
    .badge-green { background: #f0fdf4; color: #16a34a; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #9ca3af; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">hyper</div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>Hyper - Turn your influence into impact.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Creator Emails ──────────────────────────────────────────────────

export function newMatchEmail(data: {
  creatorName: string;
  restaurantName: string;
  address: string;
  brief: string;
  offer: string | null;
  hoursToRespond: number;
}) {
  const content = `
    <h1>You've been matched!</h1>
    <p>${data.creatorName}, a restaurant wants to work with you.</p>
    <hr class="divider" />
    <h2>${data.restaurantName}</h2>
    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">${data.address}</p>
    <p>${data.brief}</p>
    ${data.offer ? `<p style="font-size: 13px; color: #059669; background: #f0fdf4; border-radius: 8px; padding: 8px 12px;">Includes: ${data.offer}</p>` : ""}
    <p style="font-size: 13px; color: #6b7280;">You have <strong>${data.hoursToRespond} hours</strong> to respond before this match expires.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/creator/assignments" class="btn btn-blue">View Match</a>
    </div>
  `;
  return {
    subject: `New match: ${data.restaurantName}`,
    html: layout(content),
  };
}

export function expiringMatchEmail(data: {
  creatorName: string;
  restaurantName: string;
  hoursLeft: number;
}) {
  const urgency = data.hoursLeft <= 6 ? "badge-urgent" : "badge-warning";
  const content = `
    <h1>Match expiring soon</h1>
    <p>${data.creatorName}, your match with <strong>${data.restaurantName}</strong> is about to expire.</p>
    <div style="text-align: center; margin: 16px 0;">
      <span class="badge ${urgency}">${Math.floor(data.hoursLeft)}h left</span>
    </div>
    <p>Accept now or this opportunity will be reassigned to another creator.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/creator/assignments" class="btn">Respond Now</a>
    </div>
  `;
  return {
    subject: `Expiring: ${data.restaurantName} match - ${Math.floor(data.hoursLeft)}h left`,
    html: layout(content),
  };
}

export function matchAcceptedEmail(data: {
  creatorName: string;
  restaurantName: string;
  address: string;
}) {
  const content = `
    <h1>You're locked in!</h1>
    <p>${data.creatorName}, you've accepted the collab with <strong>${data.restaurantName}</strong>.</p>
    <hr class="divider" />
    <h2>${data.restaurantName}</h2>
    <p style="font-size: 12px; color: #9ca3af;">${data.address}</p>
    <p>Next step: schedule your visit and post your content. You'll earn $4 for every HI you generate.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/creator/assignments" class="btn">Schedule Visit</a>
    </div>
  `;
  return {
    subject: `Locked in: ${data.restaurantName}`,
    html: layout(content),
  };
}

export function dailyCreatorDigestEmail(data: {
  creatorName: string;
  todayVisits: { restaurantName: string; time: string; address: string }[];
  pendingMatches: number;
  expiringToday: number;
}) {
  const visitItems = data.todayVisits.map((v) => `
    <div class="item">
      <div class="item-name">${v.restaurantName}</div>
      <div class="item-detail">${v.time} - ${v.address}</div>
    </div>
  `).join("");

  const content = `
    <h1>Good morning, ${data.creatorName}</h1>
    <p>Here's what's on your plate today.</p>
    ${data.todayVisits.length > 0 ? `
      <hr class="divider" />
      <h2>Today's Visits</h2>
      ${visitItems}
    ` : ""}
    ${data.pendingMatches > 0 ? `
      <hr class="divider" />
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>${data.pendingMatches} pending match${data.pendingMatches > 1 ? "es" : ""}</h2>
          ${data.expiringToday > 0 ? `<p style="font-size: 12px; color: #dc2626; margin: 0;">${data.expiringToday} expiring today</p>` : ""}
        </div>
      </div>
    ` : ""}
    ${data.todayVisits.length === 0 && data.pendingMatches === 0 ? `
      <p>No visits or pending matches today. Enjoy your day!</p>
    ` : ""}
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/creator/assignments" class="btn btn-blue">Open Hyper</a>
    </div>
  `;
  return {
    subject: data.todayVisits.length > 0
      ? `Today: ${data.todayVisits.length} visit${data.todayVisits.length > 1 ? "s" : ""} scheduled`
      : data.pendingMatches > 0
        ? `You have ${data.pendingMatches} pending match${data.pendingMatches > 1 ? "es" : ""}`
        : "Your daily Hyper update",
    html: layout(content),
  };
}

export function paymentReceivedEmail(data: {
  creatorName: string;
  restaurantName: string;
  hiGenerated: number;
  amountUsd: number;
}) {
  const content = `
    <h1>You got paid!</h1>
    <p>${data.creatorName}, your collab with <strong>${data.restaurantName}</strong> has been paid out.</p>
    <div class="highlight">
      <div class="highlight-value">$${data.amountUsd.toFixed(2)}</div>
      <div class="highlight-label">${data.hiGenerated.toFixed(1)} HI x $4/HI</div>
    </div>
    <p>Keep posting great content to earn more. Your earnings are available in your dashboard.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/creator/earnings" class="btn">View Earnings</a>
    </div>
  `;
  return {
    subject: `Paid: $${data.amountUsd.toFixed(2)} from ${data.restaurantName}`,
    html: layout(content),
  };
}

// ── Restaurant Emails ───────────────────────────────────────────────

export function creatorAcceptedEmail(data: {
  brandName: string;
  creatorHandle: string;
  creatorFollowers: number;
}) {
  const content = `
    <h1>A creator accepted your collab</h1>
    <p><strong>@${data.creatorHandle}</strong> has accepted your campaign and is ready to visit.</p>
    <hr class="divider" />
    <div class="item">
      <div class="item-name">@${data.creatorHandle}</div>
      <div class="item-detail">${data.creatorFollowers.toLocaleString()} followers</div>
    </div>
    <p>They'll schedule a visit and post content about your restaurant. You'll see the results in your dashboard.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/brand/campaigns" class="btn">View Campaign</a>
    </div>
  `;
  return {
    subject: `@${data.creatorHandle} accepted your collab`,
    html: layout(content),
  };
}

export function creatorScheduledEmail(data: {
  brandName: string;
  creatorHandle: string;
  visitDate: string;
  visitTime: string;
}) {
  const content = `
    <h1>Visit scheduled</h1>
    <p><strong>@${data.creatorHandle}</strong> has booked their visit to ${data.brandName}.</p>
    <hr class="divider" />
    <div class="item">
      <div class="item-name">${data.visitDate}</div>
      <div class="item-detail">${data.visitTime}</div>
    </div>
    <p>Make sure your team knows to expect them. Great hospitality leads to great content.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/brand" class="btn">View Dashboard</a>
    </div>
  `;
  return {
    subject: `Visit booked: @${data.creatorHandle} on ${data.visitDate}`,
    html: layout(content),
  };
}

export function creatorPostedEmail(data: {
  brandName: string;
  creatorHandle: string;
  platform: string;
  postUrl: string | null;
}) {
  const content = `
    <h1>New content posted</h1>
    <p><strong>@${data.creatorHandle}</strong> just posted about ${data.brandName} on ${data.platform}.</p>
    ${data.postUrl ? `
      <div style="text-align: center; margin: 16px 0;">
        <a href="${data.postUrl}" class="btn" style="background: #6366f1;">View Post</a>
      </div>
    ` : ""}
    <p>We'll measure the HI (engagement impact) in 7 days and you'll receive the results.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/brand/reports" class="btn">View Reports</a>
    </div>
  `;
  return {
    subject: `@${data.creatorHandle} posted about ${data.brandName}`,
    html: layout(content),
  };
}

export function hiMeasuredEmail(data: {
  brandName: string;
  creatorHandle: string;
  hiScore: number;
  reach: number;
  engagements: number;
  costUsd: number;
}) {
  const content = `
    <h1>HI results are in</h1>
    <p>Here's how <strong>@${data.creatorHandle}</strong>'s post performed for ${data.brandName}.</p>
    <div class="highlight">
      <div class="highlight-value">${data.hiScore.toFixed(1)} HI</div>
      <div class="highlight-label">Hyper Influence Score</div>
    </div>
    <div style="display: flex; gap: 8px; margin: 16px 0;">
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">${data.reach.toLocaleString()}</div>
        <div style="font-size: 11px; color: #9ca3af;">Reach</div>
      </div>
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">${data.engagements.toLocaleString()}</div>
        <div style="font-size: 11px; color: #9ca3af;">Engagements</div>
      </div>
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">$${data.costUsd.toFixed(2)}</div>
        <div style="font-size: 11px; color: #9ca3af;">Cost</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/brand/reports" class="btn btn-blue">View Full Report</a>
    </div>
  `;
  return {
    subject: `Results: @${data.creatorHandle} scored ${data.hiScore.toFixed(1)} HI`,
    html: layout(content),
  };
}

export function weeklyCampaignSummaryEmail(data: {
  brandName: string;
  totalHi: number;
  totalReach: number;
  creatorsPosted: number;
  totalSpend: number;
  topCreator: { handle: string; hi: number } | null;
}) {
  const content = `
    <h1>Weekly Campaign Report</h1>
    <p>Here's how ${data.brandName}'s campaign performed this week.</p>
    <div class="highlight">
      <div class="highlight-value">${data.totalHi.toFixed(1)} HI</div>
      <div class="highlight-label">Total Influence This Week</div>
    </div>
    <div style="display: flex; gap: 8px; margin: 16px 0;">
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">${data.totalReach.toLocaleString()}</div>
        <div style="font-size: 11px; color: #9ca3af;">Reach</div>
      </div>
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">${data.creatorsPosted}</div>
        <div style="font-size: 11px; color: #9ca3af;">Creators</div>
      </div>
      <div style="flex: 1; text-align: center; background: #f9fafb; border-radius: 8px; padding: 12px;">
        <div style="font-size: 16px; font-weight: 700; color: #111;">$${data.totalSpend.toFixed(0)}</div>
        <div style="font-size: 11px; color: #9ca3af;">Spent</div>
      </div>
    </div>
    ${data.topCreator ? `
      <hr class="divider" />
      <p style="font-size: 13px;">Top creator: <strong>@${data.topCreator.handle}</strong> with ${data.topCreator.hi.toFixed(1)} HI</p>
    ` : ""}
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://hyper.so/brand/reports" class="btn">View Full Report</a>
    </div>
  `;
  return {
    subject: `Weekly report: ${data.totalHi.toFixed(1)} HI, ${data.creatorsPosted} creator${data.creatorsPosted !== 1 ? "s" : ""}`,
    html: layout(content),
  };
}
