import { Card, StatCard } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Mock post data - will be replaced with real data from posts table
// Each platform post is a separate collab card, even if from the same assignment
const MOCK_POSTS = [
  {
    id: "1",
    assignmentId: "a1",
    creator: "maria.eats.la",
    platform: "instagram",
    type: "Reel",
    thumbnail: null,
    postUrl: "https://instagram.com/p/demo_maria_bacio_1",
    likes: 2840,
    comments: 187,
    saves: 94,
    shares: 42,
    reach: 18200,
    hi: 9.9,
    postedAt: "2026-03-04",
  },
  {
    id: "4",
    assignmentId: "a1",
    creator: "maria.eats.la",
    platform: "tiktok",
    type: "Video",
    thumbnail: null,
    postUrl: "https://tiktok.com/@maria.eats.la/video/demo",
    likes: 4200,
    comments: 310,
    saves: 180,
    shares: 95,
    reach: 32000,
    hi: 12.4,
    postedAt: "2026-03-05",
  },
  {
    id: "2",
    assignmentId: "a2",
    creator: "jake.foodie",
    platform: "instagram",
    type: "Reel",
    thumbnail: null,
    postUrl: "https://instagram.com/p/demo_jake_bacio_1",
    likes: 1540,
    comments: 112,
    saves: 67,
    shares: 29,
    reach: 11500,
    hi: 7.2,
    postedAt: "2026-03-06",
  },
  {
    id: "3",
    assignmentId: "a3",
    creator: "sofia.tastes",
    platform: "instagram",
    type: "Story",
    thumbnail: null,
    postUrl: "https://instagram.com/p/demo_sofia_bacio_1",
    likes: null,
    comments: null,
    saves: null,
    shares: null,
    reach: null,
    hi: null,
    postedAt: "2026-03-09",
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400",
  tiktok: "bg-gray-900",
  youtube: "bg-red-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "IG",
  tiktok: "TikTok",
  youtube: "YT",
};

export default function PostsPage() {
  const measuredPosts = MOCK_POSTS.filter((p) => p.hi !== null);
  const totalHi = measuredPosts.reduce((sum, p) => sum + (p.hi ?? 0), 0);
  const totalLikes = measuredPosts.reduce((sum, p) => sum + (p.likes ?? 0), 0);
  const totalReach = measuredPosts.reduce((sum, p) => sum + (p.reach ?? 0), 0);
  const totalEngagements = measuredPosts.reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.saves ?? 0) + (p.shares ?? 0),
    0,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Collabs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {MOCK_POSTS.length} collab{MOCK_POSTS.length !== 1 ? "s" : ""} from your creators
        </p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total HI" value={totalHi.toFixed(1)} accent />
        <StatCard label="Reach" value={totalReach.toLocaleString()} />
        <StatCard label="Engagements" value={totalEngagements.toLocaleString()} />
        <StatCard label="Posts" value={MOCK_POSTS.length} />
      </div>

      {/* Post feed */}
      <div className="space-y-4">
        {MOCK_POSTS.map((post) => (
          <Card key={post.id} className="p-0 overflow-hidden">
            {/* Post embed placeholder */}
            <div className="bg-gray-100 aspect-square flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  {post.platform === "instagram" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="6" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" />
                    </svg>
                  ) : post.platform === "tiktok" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.21 8.21 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.12z" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF0000">
                      <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.56 31.56 0 000 12a31.56 31.56 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.56 31.56 0 0024 12a31.56 31.56 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {post.type} by @{post.creator}
                </p>
              </div>
              {/* Platform badge */}
              <div className={`absolute top-3 left-3 ${PLATFORM_COLORS[post.platform]} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                {PLATFORM_LABELS[post.platform]}
              </div>
              {/* Date badge */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                {new Date(post.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>

            {/* Metrics bar */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {post.creator.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">@{post.creator}</span>
                </div>
                {post.hi !== null ? (
                  <span className="text-sm font-bold">{post.hi.toFixed(1)} HI</span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Awaiting measurement</span>
                )}
              </div>

              {post.hi !== null ? (
                <div className="grid grid-cols-5 gap-1 text-center text-xs bg-gray-50 rounded-lg p-2">
                  <div>
                    <p className="text-gray-400">Likes</p>
                    <p className="font-semibold">{post.likes?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Cmts</p>
                    <p className="font-semibold">{post.comments?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Saves</p>
                    <p className="font-semibold">{post.saves?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Shares</p>
                    <p className="font-semibold">{post.shares?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reach</p>
                    <p className="font-semibold">{(post.reach! / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-700 text-center">
                  Metrics will be captured 7 days after posting
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {MOCK_POSTS.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-gray-500">
            No posts yet. Once creators post content, it&apos;ll show up here.
          </p>
        </Card>
      )}
    </div>
  );
}
