"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { StudioHeader } from "~/components/studio/ui";
import { contentPublicPath } from "~/lib/content";
import { appToast } from "~/lib/app-toast";
import { reorderNavMenuItems } from "~/server/content/actions";
import type { StudioNavMenuRow } from "~/server/content/queries";
import { studioContentPanel } from "~/lib/studio-content-surface";
import {
  appOutlineButtonStudio,
  appPrimaryButtonStudio,
} from "~/lib/surface";
import { cn } from "~/lib/utils";

function orderKey(rows: StudioNavMenuRow[]): string {
  return rows.map((row) => row.id).join("|");
}

const rowShellClass =
  "flex items-center gap-3 border-b border-[#15130f]/10 bg-white px-4 py-3 last:border-b-0";

function NavRowDetails({ item }: { item: StudioNavMenuRow }) {
  const label = item.navLabel?.trim() || item.title;
  const href = contentPublicPath("page", item.slug, item.isHomepage);
  const published = item.status === "published";

  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#15130f]">{label}</p>
        <p className="mt-0.5 font-mono text-[11px] text-[#9a9488]">{href}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase",
          published
            ? "bg-[#e8f5e9] text-[#2e7d32]"
            : "bg-sc-section-alt text-[#6f6a60]",
        )}
      >
        {published ? "Published" : "Draft"}
      </span>
      <Link
        href={`/studio/content/${item.id}`}
        className="shrink-0 text-[11px] font-semibold text-[#57524a] hover:text-sc-accent"
      >
        Edit
      </Link>
    </>
  );
}

function StaticNavRow({ item }: { item: StudioNavMenuRow }) {
  return (
    <li className={rowShellClass}>
      <span className="text-[#9a9488]" aria-hidden>
        <GripVertical className="size-4" />
      </span>
      <NavRowDetails item={item} />
    </li>
  );
}

function SortableNavRow({ item }: { item: StudioNavMenuRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const label = item.navLabel?.trim() || item.title;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(rowShellClass, isDragging && "z-10 shadow-md")}
    >
      <button
        type="button"
        className="text-[#9a9488] hover:text-[#15130f]"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <NavRowDetails item={item} />
    </li>
  );
}

export function ContentNavigationWorkspace({
  items,
}: {
  items: StudioNavMenuRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [savedKey, setSavedKey] = useState(() => orderKey(items));
  const [dndReady, setDndReady] = useState(false);
  const [pending, startTransition] = useTransition();

  const serverKey = useMemo(() => orderKey(items), [items]);

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    setRows(items);
    setSavedKey(serverKey);
  }, [items, serverKey]);

  const dirty = orderKey(rows) !== savedKey;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row.id === active.id);
    const newIndex = rows.findIndex((row) => row.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setRows(arrayMove(rows, oldIndex, newIndex));
  };

  const onDiscard = () => {
    setRows(items);
    setSavedKey(serverKey);
  };

  const onSave = () => {
    if (!dirty) return;
    startTransition(async () => {
      await reorderNavMenuItems(rows.map((row) => row.id));
      setSavedKey(orderKey(rows));
      appToast.success("Navigation order saved.");
      router.refresh();
    });
  };

  const headerActions =
    items.length > 0 ? (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={!dirty || pending}
          className={cn(
            appOutlineButtonStudio,
            (!dirty || pending) && "cursor-not-allowed opacity-50",
          )}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || pending}
          className={cn(
            appPrimaryButtonStudio,
            "gap-1.5",
            (!dirty || pending) && "cursor-not-allowed opacity-50",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Save order"
          )}
        </button>
      </div>
    ) : null;

  return (
    <div>
      <StudioHeader
        title="Main navigation"
        description={
          items.length > 0
            ? dirty
              ? "Drag to reorder header links, then save. You have unsaved changes."
              : "Drag to reorder header links, then save. Only published pages appear on the public site."
            : "Manage which pages appear in the header from the content list or each page’s Publishing panel."
        }
        actions={headerActions}
      />

      {items.length === 0 ? (
        <p className={`px-4 py-8 text-sm text-[#6f6a60] ${studioContentPanel}`}>
          No pages are marked for the main menu yet. Open a page, set type to{" "}
          <strong>Page</strong>, and enable{" "}
          <strong>Show in main navigation</strong> under Publishing — or use the{" "}
          <strong>In menu</strong> toggle on the content list.
        </p>
      ) : (
        <div className={studioContentPanel}>
          <p className="border-b border-[#15130f]/10 px-4 py-3 text-xs text-[#6f6a60]">
            If no pages are in the menu, visitors see a single{" "}
            <strong>Home</strong> link to <span className="font-mono">/</span>.
          </p>
          {!dndReady ? (
            <ul>
              {rows.map((item) => (
                <StaticNavRow key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={rows.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {rows.map((item) => (
                    <SortableNavRow key={item.id} item={item} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}
