"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type LexicalNode, type NodeKey } from "lexical";
import { Trash2, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

export function InlineText({
  value,
  onChange,
  as: Tag = "span",
  className,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (document.activeElement === element) return;
    const next = multiline ? value : value;
    if (element.innerText !== next) element.innerText = next;
  }, [value, multiline]);

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      spellCheck
      className={cn("content-inline-edit", className)}
      onInput={(event: React.FormEvent<HTMLElement>) =>
        onChange(
          multiline
            ? event.currentTarget.innerText
            : event.currentTarget.innerText.replace(/\n/g, " "),
        )
      }
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        event.stopPropagation();
        if (event.key === "Escape") event.currentTarget.blur();
        if (!multiline && event.key === "Enter") event.preventDefault();
      }}
      onPaste={(event: React.ClipboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
    />
  );
}

export function BlockDecoratorToolbar({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-3 opacity-0 transition-opacity group-hover/block:opacity-100 focus-within:opacity-100">
      <div className="pointer-events-auto flex items-center gap-1 rounded-md bg-[#15130f]/90 px-1.5 py-1 text-white shadow-lg backdrop-blur">
        <span className="px-1.5 text-[9px] font-bold tracking-[0.16em] text-white/50 uppercase">
          {label}
        </span>
        {children}
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${label} section`}
          aria-label={`Remove ${label} section`}
          className="inline-flex size-7 items-center justify-center rounded text-white/75 transition-colors hover:bg-red-500/80 hover:text-white"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ToolbarIconButton({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded text-white/75 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="size-3.5" />
    </button>
  );
}

export function useSectionNodeUpdate<T extends Record<string, unknown>>(
  nodeKey: NodeKey,
  isNode: (
    node: LexicalNode | null | undefined,
  ) => node is LexicalNode & {
    setData: (data: T) => void;
    getData: () => T;
  },
) {
  const [editor] = useLexicalComposerContext();

  const update = (patch: Partial<T>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (isNode(node)) {
        node.setData({ ...node.getData(), ...patch });
      }
    });
  };

  const remove = () => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  };

  return { update, remove, editor };
}

const sectionOptionsPanelClass =
  "border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg";

export function SectionOptionsDialog({
  triggerLabel,
  icon: Icon,
  title,
  description,
  children,
}: {
  triggerLabel: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarIconButton
        label={triggerLabel}
        icon={Icon}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={sectionOptionsPanelClass}>
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="space-y-5 pt-1 text-sm text-[#57524a]">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SectionOptionLegend({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase">
      {children}
    </p>
  );
}

export function SectionOptionCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-[#15130f]/20"
      />
      <span>{label}</span>
    </label>
  );
}

export function SectionOptionSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <SectionOptionLegend>{label}</SectionOptionLegend>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded border border-[#15130f]/15 bg-white px-2 text-sm text-[#15130f]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
