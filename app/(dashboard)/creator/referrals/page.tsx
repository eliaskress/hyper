import { Card } from "@/components/ui/card";
import { ReferralActions } from "./referral-actions";

export const dynamic = "force-dynamic";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_HANDLE = "maria.santos";

// In production this would be a real short link per creator
const REFERRAL_CODE = "MARIA-HYPER";
const REFERRAL_LINK = `https://hyper.la/join/${REFERRAL_CODE}`;

export default function ReferralsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Invite creators, earn 25% of their revenue for 2 years.
        </p>
      </div>

      {/* How it works */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">How it works</h2>
        <div className="flex flex-col gap-3">
          {[
            { step: "1", text: "Share your link or QR code with another creator" },
            { step: "2", text: "They sign up and start earning on Hyper" },
            { step: "3", text: "You earn 25% of their Hyper revenue for 2 years" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                {item.step}
              </span>
              <p className="text-sm text-gray-600 pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* QR Code + Link */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 text-center">Your referral code</h2>

        {/* QR Code placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center p-3">
            <QrCode url={REFERRAL_LINK} />
          </div>
        </div>

        {/* Referral link + copy */}
        <ReferralActions referralLink={REFERRAL_LINK} referralCode={REFERRAL_CODE} />
      </Card>

      {/* Earnings preview */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Potential earnings</h2>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">If your referral earns $100/mo</span>
            <span className="text-sm font-bold">$25/mo for you</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">If your referral earns $500/mo</span>
            <span className="text-sm font-bold">$125/mo for you</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">If your referral earns $1,000/mo</span>
            <span className="text-sm font-bold">$250/mo for you</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          No cap on how many creators you can refer. Each earns you 25% for 24 months.
        </p>
      </Card>

      {/* Referred creators (empty state for now) */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Your referrals</h2>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No referrals yet.</p>
          <p className="text-xs text-gray-400 mt-1">Share your link to start earning.</p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Simple deterministic QR code rendered as SVG.
 * In production, use a proper QR library. This renders a visual placeholder
 * that looks like a real QR code using a grid pattern.
 */
function QrCode({ url }: { url: string }) {
  // Generate a deterministic pattern from the URL
  const size = 21; // QR version 1 is 21x21
  const cells: boolean[][] = [];

  // Simple hash-based pattern generation
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }

  for (let row = 0; row < size; row++) {
    cells[row] = [];
    for (let col = 0; col < size; col++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = row < 7 && col < 7;
      const inFinderTR = row < 7 && col >= size - 7;
      const inFinderBL = row >= size - 7 && col < 7;

      if (inFinderTL || inFinderTR || inFinderBL) {
        const localRow = inFinderTL ? row : inFinderTR ? row : row - (size - 7);
        const localCol = inFinderTL ? col : inFinderTR ? col - (size - 7) : col;
        // Finder pattern: outer ring, space, inner square
        const isOuter = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
        const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
        cells[row][col] = isOuter || isInner;
      } else {
        // Pseudo-random data modules
        const seed = (hash + row * 31 + col * 17) ^ (row * col);
        cells[row][col] = (seed & 3) !== 0; // ~75% fill for visual density
      }
    }
  }

  const cellSize = 100 / size;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
              rx={cellSize * 0.1}
            />
          ) : null
        )
      )}
    </svg>
  );
}
