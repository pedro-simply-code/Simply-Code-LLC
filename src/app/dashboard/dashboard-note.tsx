"use client";

import { useAtom } from "jotai";
import { dashboardNoteAtom } from "~/state/example";

export function DashboardNote() {
  const [note, setNote] = useAtom(dashboardNoteAtom);

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium">Jotai example</p>
      <input
        className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}
