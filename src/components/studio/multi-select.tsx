"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { appDropdown, appInput } from "~/lib/surface";
import { cn } from "~/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export function MultiSelect({
  name,
  options,
  defaultValue = [],
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  className,
  ariaLabel,
}: {
  name: string;
  options: MultiSelectOption[];
  defaultValue?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const listId = useId();

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  );

  return (
    <div className={cn("space-y-2", className)}>
      {selected.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-controls={listId}
            className={cn(
              appInput,
              "hover:ring-sc-accent/35 flex items-center justify-between gap-3 py-2 text-left",
            )}
          >
            <span
              className={cn(
                "truncate",
                selected.length === 0 && "text-[#9a9488]",
              )}
            >
              {selected.length === 0
                ? placeholder
                : `${selected.length} selected`}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-[#9a9488]" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={listId}
          align="start"
          className={cn(
            appDropdown,
            "w-[var(--radix-popover-trigger-width)] p-0 text-[#15130f]",
          )}
        >
          <Command className="bg-sc-section text-[#15130f] [&_[cmdk-input]]:text-[#15130f] [&_[cmdk-input]]:placeholder:text-[#9a9488]">
            <CommandInput
              placeholder={searchPlaceholder}
              className="text-[#15130f]"
            />
            <CommandList>
              <CommandEmpty className="text-[#6f6a60]">
                {emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={[option.label, option.description]
                        .filter(Boolean)
                        .join(" ")}
                      onSelect={() => toggle(option.value)}
                      className="data-[selected=true]:bg-sc-section-alt aria-selected:bg-sc-section-alt cursor-pointer text-[#15130f] aria-selected:text-[#15130f] data-[selected=true]:text-[#15130f]"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-sm shadow-[inset_0_1px_2px_rgba(21,19,15,0.08)] ring-1 ring-[#15130f]/20",
                          active && "bg-[#15130f] text-white ring-[#15130f]",
                        )}
                      >
                        {active ? <Check className="size-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="block truncate text-xs text-[#9a9488]">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="outline"
              className="gap-1 border-[#15130f]/20 bg-white text-[#15130f]"
            >
              {option.label}
              <button
                type="button"
                onClick={() => toggle(option.value)}
                className="ml-0.5 text-[#6f6a60] hover:text-[#15130f]"
                aria-label={`Remove ${option.label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
