import type { users } from "~/server/db/schema";
import { AvatarUpload } from "~/components/profile/avatar-upload";
import { Field, StudioCard, StudioInput, StudioSelect, StudioTextarea } from "~/components/studio/ui";
import { PROFILE_TIMEZONES } from "~/lib/profile";
import { appPrimaryButtonStudioSubmit } from "~/lib/surface";
import { cn } from "~/lib/utils";
import { updateUserProfile } from "~/server/profile/actions";

const profileTextareaClass = "min-h-0 resize-y";

export function ProfileForm({
  user,
  showAboutFields,
  canEditAboutVisibility = false,
}: {
  user: typeof users.$inferSelect;
  showAboutFields: boolean;
  /** Founders only — leads and developers are listed on About by founder from Team. */
  canEditAboutVisibility?: boolean;
}) {
  return (
    <form action={updateUserProfile} className="flex w-full flex-col">
      <div className="grid gap-6 pb-6 lg:grid-cols-12 lg:gap-8">
        <StudioCard
          title="Photo"
          description={
            showAboutFields
              ? "Shown on the public About page when your profile is listed there."
              : "Your photo in the client portal and on messages from your team."
          }
          className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex justify-center lg:justify-start">
            <AvatarUpload key={user.image ?? "no-avatar"} defaultUrl={user.image} />
          </div>
        </StudioCard>

        <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
          <StudioCard title="Account">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Name"
                hint="Your display name across studio, portal, and the site."
                className="md:col-span-2"
              >
                <StudioInput name="name" defaultValue={user.name ?? ""} required />
              </Field>
              <Field label="Email" className="md:col-span-2">
                <StudioInput value={user.email ?? ""} readOnly disabled className="opacity-70" />
              </Field>
            </div>
          </StudioCard>

          <StudioCard
            title="Contact & scheduling"
            description="Helps your project lead and clients reach you in the right time window."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Phone (optional)"
                hint="Used for urgent project contact — not shown on the public site."
              >
                <StudioInput
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={user.phone ?? ""}
                  placeholder="+1 555 000 0000"
                />
              </Field>
              <Field label="Timezone" hint="Used for meeting invites and portal timestamps.">
                <StudioSelect name="timezone" defaultValue={user.timezone ?? ""}>
                  {PROFILE_TIMEZONES.map((zone) => (
                    <option key={zone.value || "unset"} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </StudioSelect>
              </Field>
              <Field
                label="Short bio (optional)"
                hint={
                  showAboutFields
                    ? "One or two sentences on the About page. Keep it client-facing."
                    : "Optional note for your team (company, role, or how you prefer to collaborate)."
                }
                className="md:col-span-2"
              >
                <StudioTextarea
                  name="bio"
                  rows={3}
                  defaultValue={user.bio ?? ""}
                  className={profileTextareaClass}
                  placeholder={
                    showAboutFields
                      ? "I lead full-stack builds with a focus on Next.js and polished UX…"
                      : "Product owner at Acme — prefer async updates in the portal."
                  }
                  maxLength={500}
                />
              </Field>
            </div>
          </StudioCard>

          {showAboutFields ? (
            <StudioCard
              title="Public team profile"
              description="Controls how you appear on /about#team. Skills from Studio → Technologies take priority over the list below."
            >
              <div className="flex flex-col gap-6">
                {canEditAboutVisibility ? (
                  <label className="flex cursor-pointer items-start gap-3 rounded-md bg-sc-section-alt/80 px-4 py-3 ring-1 ring-[#15130f]/8">
                    <input
                      type="checkbox"
                      name="showOnAbout"
                      defaultChecked={user.showOnAbout}
                      className="mt-0.5 size-4 accent-sc-accent"
                    />
                    <span className="text-sm leading-snug text-sc-ink">
                      <span className="font-semibold">List me on the public About page</span>
                      <span className="mt-1 block text-xs text-[#6f6a60]">
                        For your own founder profile. Other team members are added from Studio → Team.
                      </span>
                    </span>
                  </label>
                ) : (
                  <p className="rounded-md bg-sc-section-alt/80 px-4 py-3 text-xs leading-relaxed text-[#6f6a60] ring-1 ring-[#15130f]/8">
                    Whether you appear on the public About page is managed by a founder in Studio →
                    Team.
                  </p>
                )}

                <Field
                  label="Title on site"
                  hint="e.g. Full Stack Developer · Project Lead"
                >
                  <StudioInput
                    name="title"
                    defaultValue={user.title ?? ""}
                    placeholder="Your role line on About"
                  />
                </Field>

                <Field
                  label="Extra skills (optional)"
                  hint="Comma-separated. Shown only when no technologies are assigned in Studio."
                >
                  <StudioTextarea
                    name="profileSkills"
                    rows={3}
                    defaultValue={user.profileSkills?.join(", ") ?? ""}
                    className={profileTextareaClass}
                    placeholder="Next.js, WordPress, React…"
                  />
                </Field>

                <div className="space-y-4 border-t border-[#15130f]/10 pt-6">
                  <div>
                    <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase">
                      Professional links
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#6f6a60]">
                      Optional links on your About card. Use full URLs (https://…).
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="LinkedIn">
                      <StudioInput
                        name="linkedinUrl"
                        type="url"
                        defaultValue={user.linkedinUrl ?? ""}
                        placeholder="https://linkedin.com/in/you"
                      />
                    </Field>
                    <Field label="GitHub">
                      <StudioInput
                        name="githubUrl"
                        type="url"
                        defaultValue={user.githubUrl ?? ""}
                        placeholder="https://github.com/you"
                      />
                    </Field>
                    <Field label="Portfolio or website" className="md:col-span-2">
                      <StudioInput
                        name="portfolioUrl"
                        type="url"
                        defaultValue={user.portfolioUrl ?? ""}
                        placeholder="https://yoursite.com"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </StudioCard>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-4 mt-auto flex flex-wrap items-center justify-end gap-3",
          "border-t border-[#15130f]/10 bg-sc-canvas/95 px-4 py-4 backdrop-blur-md",
          "lg:-mx-8 lg:px-8",
        )}
      >
        <p className="mr-auto hidden text-xs text-[#6f6a60] sm:block">
          Changes apply after you save. Email is managed by your account administrator.
        </p>
        <button type="submit" className={appPrimaryButtonStudioSubmit}>
          Save profile
        </button>
      </div>
    </form>
  );
}
