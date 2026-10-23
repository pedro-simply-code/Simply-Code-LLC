"use client";

import { useEffect, useState, type ReactNode } from "react";
import { updateSiteSettings } from "~/server/site-settings/actions";
import {
  SITE_CORNER_RADIUS,
  SITE_CORNER_RADIUS_DESCRIPTIONS,
  SITE_CORNER_RADIUS_LABELS,
  SITE_SURFACE_STYLE_DESCRIPTIONS,
  SITE_SURFACE_STYLE_LABELS,
  SITE_SURFACE_STYLES,
  type SiteCornerRadius,
  type SiteSettings,
} from "~/lib/site-settings";
import { applySiteSettingsToDocument } from "~/lib/site-settings-client";
import {
  SITE_COLOR_PALETTES,
  SITE_PALETTE_LABELS,
  SITE_PALETTE_NOTES,
  SITE_PALETTE_SWATCH,
  type SiteColorPalette,
} from "~/lib/site-palette";
import { Field, StudioCard, StudioTextarea } from "~/components/studio/ui";
import { appPanelMuted, appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";

/** Card-level radius (matches `--site-radius-lg` tokens). */
const SETTINGS_TILE_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-4";

const CORNER_TILE_RADIUS_LG: Record<SiteCornerRadius, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
};

function GridTile({
  selected,
  onSelect,
  label,
  description,
  preview,
  tileBorderRadiusPx,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  preview?: ReactNode;
  /** When set, the tile itself shows that corner radius (corner radius picker). */
  tileBorderRadiusPx?: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={
        tileBorderRadiusPx !== undefined ? { borderRadius: tileBorderRadiusPx } : undefined
      }
      className={cn(
        "flex h-full flex-col p-3 text-left transition-colors",
        appPanelMuted,
        selected && "ring-2 ring-sc-accent/50",
      )}
    >
      {preview ? <div className="mb-3">{preview}</div> : null}
      <span className="text-sm font-semibold text-sc-ink">{label}</span>
      {description ? (
        <span className="mt-1 text-[11px] leading-relaxed text-[#6f6a60]">{description}</span>
      ) : null}
    </button>
  );
}

function PalettePreview({ palette }: { palette: SiteColorPalette }) {
  const swatch = SITE_PALETTE_SWATCH[palette];
  return (
    <div className="flex gap-1" aria-hidden>
      <span
        className="h-10 flex-1 rounded-sm ring-1 ring-[#15130f]/10"
        style={{ backgroundColor: swatch.canvas }}
      />
      <span
        className="h-10 flex-1 rounded-sm ring-1 ring-[#15130f]/10"
        style={{ backgroundColor: swatch.section }}
      />
      <span
        className="h-10 w-8 rounded-sm ring-1 ring-[#15130f]/10"
        style={{ backgroundColor: swatch.accent }}
      />
      <span
        className="h-10 w-8 rounded-sm ring-1 ring-[#15130f]/10"
        style={{ backgroundColor: swatch.bright }}
      />
    </div>
  );
}

export function SiteSettingsForm({ settings: initial }: { settings: SiteSettings }) {
  const [draft, setDraft] = useState<SiteSettings>(initial);

  useEffect(() => {
    applySiteSettingsToDocument(draft);
  }, [draft]);

  useEffect(() => {
    return () => {
      applySiteSettingsToDocument(initial);
    };
  }, [initial]);

  const patch = (partial: Partial<SiteSettings>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  return (
    <form action={updateSiteSettings} className="grid w-full gap-8">
      <input type="hidden" name="colorPalette" value={draft.colorPalette} />
      <input type="hidden" name="surfaceStyle" value={draft.surfaceStyle} />
      <input type="hidden" name="cornerRadius" value={draft.cornerRadius} />
      <input type="hidden" name="maintenanceMessage" value={draft.maintenanceMessage} />

      <StudioCard
        title="Color palette"
        description="For seasonal or campaign refreshes—winter blues, summer orange, holiday rose—not everyday tweaks. Preview updates live; save when you are ready to ship the look."
      >
        <div className={SETTINGS_TILE_GRID}>
          {SITE_COLOR_PALETTES.map((palette) => (
            <GridTile
              key={palette}
              selected={draft.colorPalette === palette}
              onSelect={() => patch({ colorPalette: palette })}
              label={SITE_PALETTE_LABELS[palette]}
              description={SITE_PALETTE_NOTES[palette]}
              preview={<PalettePreview palette={palette} />}
            />
          ))}
        </div>
      </StudioCard>

      <StudioCard
        title="Surfaces"
        description="Panels, cards, inputs, and controls share one surface style."
      >
        <div className={SETTINGS_TILE_GRID}>
          {SITE_SURFACE_STYLES.map((style) => (
            <GridTile
              key={style}
              selected={draft.surfaceStyle === style}
              onSelect={() => patch({ surfaceStyle: style })}
              label={SITE_SURFACE_STYLE_LABELS[style]}
              description={SITE_SURFACE_STYLE_DESCRIPTIONS[style]}
            />
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase">Corner radius</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6f6a60]">
            Cards use the larger radius; buttons and inputs use the smaller one.
          </p>
          <div className={cn("mt-4", SETTINGS_TILE_GRID)}>
            {SITE_CORNER_RADIUS.map((radius) => (
              <GridTile
                key={radius}
                selected={draft.cornerRadius === radius}
                onSelect={() => patch({ cornerRadius: radius })}
                label={SITE_CORNER_RADIUS_LABELS[radius]}
                description={SITE_CORNER_RADIUS_DESCRIPTIONS[radius]}
                tileBorderRadiusPx={CORNER_TILE_RADIUS_LG[radius]}
              />
            ))}
          </div>
        </div>
      </StudioCard>

      <StudioCard
        title="Maintenance"
        description="Replaces the public marketing site with a maintenance page."
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="maintenanceMode"
            value="on"
            checked={draft.maintenanceMode}
            onChange={(event) => patch({ maintenanceMode: event.target.checked })}
            className="mt-1 size-4 rounded accent-sc-accent"
          />
          <span>
            <span className="block text-sm font-semibold text-sc-ink">Maintenance mode</span>
            <span className="mt-0.5 block text-xs text-[#6f6a60]">
              Public pages only. Studio, portal, and login stay available.
            </span>
          </span>
        </label>
        <div className="mt-4">
          <Field label="Maintenance message">
            <StudioTextarea
              name="_maintenanceMessageUi"
              rows={3}
              maxLength={500}
              value={draft.maintenanceMessage}
              onChange={(event) => patch({ maintenanceMessage: event.target.value })}
              placeholder="We are making improvements…"
            />
          </Field>
        </div>
      </StudioCard>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={appPrimaryButtonStudioSubmit}>
          Save settings
        </button>
        <p className="text-xs text-[#9a9488]">
          Preview updates instantly. Save to apply for everyone.
        </p>
      </div>
    </form>
  );
}
