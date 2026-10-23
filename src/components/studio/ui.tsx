import type { ComponentProps, ReactNode } from "react";
import { cn } from "~/lib/utils";

export const inputClass =
  "w-full border border-[#15130f]/20 bg-white px-3 py-2 text-sm text-[#15130f] outline-none transition-colors placeholder:text-[#9a9488] focus:border-[#b8770a]";

export function StudioHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-black tracking-[-0.03em] uppercase">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#57524a]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StudioCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-[#15130f]/12 bg-white p-5", className)}>
      {title ? (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold tracking-[0.16em] uppercase">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-[#6f6a60]">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  as = "label",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  as?: "label" | "div";
}) {
  const Comp = as;
  return (
    <Comp className={cn("block space-y-1.5", className)}>
      <span className="text-[10px] font-bold tracking-[0.14em] text-[#57524a] uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-[#9a9488]">{hint}</span> : null}
    </Comp>
  );
}

export function StudioInput(props: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function StudioTextarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-24", props.className)} />;
}

export function StudioSelect(props: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, props.className)} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-[#15130f]/20 p-6 text-sm text-[#6f6a60]">{children}</p>;
}
