import { StudioCard } from "~/components/studio/ui";

type AuditRow = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
  actorName: string | null;
  actorEmail: string | null;
};

export function AuditLogPanel({ events }: { events: AuditRow[] }) {
  return (
    <StudioCard
      title="Audit log"
      description="Recent security and administration events (last 50)."
    >
      {events.length === 0 ? (
        <p className="text-sm text-[#6f6a60]">No events recorded yet.</p>
      ) : (
        <ul className="divide-y divide-[#15130f]/10">
          {events.map((event) => (
            <li key={event.id} className="py-3">
              <p className="text-sm font-semibold">{event.action}</p>
              <p className="mt-1 text-xs text-[#57524a]">
                {event.actorName ?? event.actorEmail ?? "System"}
                {event.entityType ? ` · ${event.entityType}` : ""}
                {event.ipAddress ? ` · ${event.ipAddress}` : ""}
              </p>
              <p className="mt-1 text-[10px] text-[#9a9488]">
                {event.createdAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </StudioCard>
  );
}
