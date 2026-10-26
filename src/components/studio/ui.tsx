import type { ComponentProps, ReactNode } from "react";
import { appEmptyState, appInput, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

export const inputClass = appInput;

export function StudioHeader({
  title,
  description,
  descriptionClassName,
  actions,
}: {
  title: string;
  description?: string;
  descriptionClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-black tracking-[-0.03em] uppercase">
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-2xl text-sm leading-relaxed text-[#57524a]",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
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
    <section className={cn(appPanel, "p-5", className)}>
      {title ? (
        <div className="mb-4">
          <h2 className="text-[12px] font-bold tracking-[0.16em] uppercase">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-[#6f6a60]">
              {description}
            </p>
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
      {hint ? (
        <span className="block text-[11px] text-[#9a9488]">{hint}</span>
      ) : null}
    </Comp>
  );
}

export function StudioInput(props: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function StudioTextarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(inputClass, "min-h-24", props.className)}
    />
  );
}

export function StudioSelect(props: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, props.className)} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={appEmptyState}>{children}</p>;
}
