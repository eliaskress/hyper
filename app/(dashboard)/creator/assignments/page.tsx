export const dynamic = "force-dynamic";

import { getCreatorAssignments } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HiEarnings } from "@/components/ui/hi-display";
import { WhatsAppPreview } from "@/components/ui/whatsapp-preview";
import Link from "next/link";

const DEMO_CREATOR_ID = "00000000-0000-0000-0000-000000000001";

export default async function AssignmentsPage() {
  const assignments = await getCreatorAssignments(DEMO_CREATOR_ID);

  // Group by status
  const upcoming = assignments.filter((a) => ["invited", "accepted", "scheduled"].includes(a.status));
  const active = assignments.filter((a) => ["posted", "measured"].includes(a.status));
  const completed = assignments.filter((a) => a.status === "paid");
  const declined = assignments.filter((a) => a.status === "declined");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Collabs</h1>
        <p className="text-gray-400 text-sm">Restaurant visits matched by Hyper.</p>
      </div>

      {/* Lifecycle explanation */}
      <div className="bg-gray-50 rounded-xl p-3 mb-6">
        <p className="text-xs text-gray-500 text-center">
          Invited &rarr; Locked in &rarr; Scheduled &rarr; Posted &rarr; Measured &rarr; Paid
        </p>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="Upcoming" count={upcoming.length}>
          {upcoming.map((a) => (
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

      {assignments.length === 0 && (
        <Card className="text-center py-10">
          <p className="font-medium text-gray-900 mb-1">No collabs yet</p>
          <p className="text-sm text-gray-400">
            Hyper will match you with restaurants based on your HIG score and location.
          </p>
        </Card>
      )}

      {/* WhatsApp Preview */}
      <div className="mt-6">
        <Card>
          <h3 className="text-sm font-semibold mb-3">How invitations arrive</h3>
          <WhatsAppPreview
            messages={[
              {
                from: "hyper",
                text: "Hi Maria! You've been matched with Bacio di Latte.\n\nBrief: Post a Reel featuring our gelato...\n\nReply YES to accept.",
                time: "10:30 AM",
              },
              { from: "user", text: "YES", time: "10:32 AM" },
              {
                from: "hyper",
                text: "You're in! Pick a visit time:\n\nAvailable: Mon-Sun, Lunch & Dinner\nSchedule type: Flexible (pick a time range)",
                time: "10:32 AM",
              },
            ]}
          />
        </Card>
      </div>
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
