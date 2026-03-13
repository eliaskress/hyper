export const dynamic = "force-dynamic";

import { getCreatorAssignments } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import Link from "next/link";
import { CollabsTabs } from "./collabs-tabs";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function AssignmentsPage() {
  const assignments = await getCreatorAssignments(DEMO_CREATOR_ID);

  // Open Collabs = matched but not yet responded
  const matched = assignments.filter((a) => a.status === "invited");

  // My Collabs = accepted and beyond
  const accepted = assignments.filter((a) => ["accepted", "scheduled"].includes(a.status));
  const active = assignments.filter((a) => ["posted", "measured"].includes(a.status));
  const completed = assignments.filter((a) => a.status === "paid");
  const declined = assignments.filter((a) => a.status === "declined");
  const myCount = accepted.length + active.length + completed.length + declined.length;

  const openTab = (
    <>
      {matched.length > 0 ? (
        <div className="flex flex-col gap-3">
          {matched.map((a) => (
            <Link key={a.id} href={`/creator/assignments/${a.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.businessName}</p>
                    {a.address && <p className="text-xs text-gray-400 mt-0.5">{a.address}</p>}
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">Matched</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{a.contentBrief}</p>
                {a.offerDescription && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 mb-2">
                    Includes: {a.offerDescription}
                  </p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  {a.responseDueAt ? (
                    <DueCountdown dueAt={a.responseDueAt} />
                  ) : (
                    <span className="text-xs text-blue-600 font-medium">Tap to view details</span>
                  )}
                  <span className="text-gray-400 text-sm">&rarr;</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No new matches right now</p>
          <p className="text-sm text-gray-400">Hyper will match you with restaurants based on your HIG score and location.</p>
        </Card>
      )}
    </>
  );

  const myTab = (
    <>
      {/* Accepted / Scheduled */}
      {accepted.length > 0 && (
        <Section title="Upcoming" count={accepted.length}>
          {accepted.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {/* Active (posted/measured) */}
      {active.length > 0 && (
        <Section title="In Progress" count={active.length}>
          {active.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Section title="Completed" count={completed.length}>
          {completed.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {/* Declined */}
      {declined.length > 0 && (
        <Section title="Declined" count={declined.length}>
          {declined.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </Section>
      )}

      {myCount === 0 && (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No collabs yet</p>
          <p className="text-sm text-gray-400">
            Accept a match from New Matches to get started.
          </p>
        </Card>
      )}
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Collabs</h1>
        <p className="text-gray-400 text-sm">Restaurant visits matched by Hyper.</p>
      </div>

      <CollabsTabs
        openTab={openTab}
        myTab={myTab}
        openCount={matched.length}
        myCount={myCount}
      />
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400">{count}</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function DueCountdown({ dueAt }: { dueAt: Date }) {
  const now = new Date();
  const diff = dueAt.getTime() - now.getTime();

  if (diff <= 0) {
    return <span className="text-xs text-red-600 font-medium">Expired</span>;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 6) {
    return (
      <span className="text-xs text-red-600 font-medium">
        {hours}h {minutes}m left to respond
      </span>
    );
  }
  if (hours < 24) {
    return (
      <span className="text-xs text-amber-600 font-medium">
        {hours}h left to respond
      </span>
    );
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return (
    <span className="text-xs text-blue-600 font-medium">
      {days}d {remainingHours}h left to respond
    </span>
  );
}

function AssignmentCard({ assignment: a }: { assignment: Awaited<ReturnType<typeof getCreatorAssignments>>[number] }) {
  return (
    <Link href={`/creator/assignments/${a.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{a.businessName}</p>
            {a.address && <p className="text-xs text-gray-400 mt-0.5">{a.address}</p>}
          </div>
          <StatusBadge status={a.status} />
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{a.contentBrief}</p>
        {a.offerDescription && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 mb-2">
            Includes: {a.offerDescription}
          </p>
        )}

        {/* Schedule info */}
        {a.scheduledDate && (
          <div className="text-xs text-gray-500 mb-2">
            {["invited", "accepted", "scheduled"].includes(a.status) ? "Visit: " : "Visited: "}
            {new Date(a.scheduledDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {a.scheduleTimeStart && ` at ${a.scheduleTimeStart}`}
            {a.scheduleType === "flexible" && a.scheduleTimeEnd && `-${a.scheduleTimeEnd}`}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          {a.hiCalculated ? (
            <HiEarnings hi={a.hiCalculated} className="text-sm" />
          ) : a.status === "invited" ? (
            <span className="text-xs text-blue-600 font-medium">Tap to respond</span>
          ) : a.status === "accepted" ? (
            <span className="text-xs text-indigo-600 font-medium">Schedule your visit</span>
          ) : a.status === "scheduled" && !a.postUrl ? (
            <span className="text-xs text-purple-600 font-medium">Submit your post</span>
          ) : a.status === "posted" ? (
            <span className="text-xs text-amber-600 font-medium">Awaiting measurement</span>
          ) : (
            <span />
          )}
          <span className="text-gray-400 text-sm">&rarr;</span>
        </div>
      </Card>
    </Link>
  );
}
