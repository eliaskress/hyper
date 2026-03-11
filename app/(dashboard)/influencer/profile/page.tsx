export const dynamic = "force-dynamic";

import { getCreatorProfile, getCreatorStats } from "@/lib/db/queries";
import { ProfileTabs } from "./profile-tabs";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function InfluencerProfile() {
  const profile = await getCreatorProfile(DEMO_CREATOR_ID);
  const stats = await getCreatorStats(DEMO_CREATOR_ID);

  if (!profile) return <p>Profile not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Profile</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your creator account.</p>

      <ProfileTabs profile={profile} stats={stats} />
    </div>
  );
}
