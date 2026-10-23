import type { users } from "~/server/db/schema";
import { AvatarUpload } from "~/components/profile/avatar-upload";
import { Field, StudioCard, StudioInput, StudioTextarea } from "~/components/studio/ui";
import { updateUserProfile } from "~/server/profile/actions";

export function ProfileForm({
  user,
  showAboutFields,
}: {
  user: typeof users.$inferSelect;
  showAboutFields: boolean;
}) {
  return (
    <form action={updateUserProfile} className="max-w-2xl space-y-6">
      <StudioCard title="Photo" description="Shown on the public About page when you appear in the team section.">
        <AvatarUpload key={user.image ?? "no-avatar"} defaultUrl={user.image} />
      </StudioCard>

      <StudioCard title="Account">
        <div className="grid gap-4">
          <Field label="Name" hint="Your display name across studio, portal, and the site.">
            <StudioInput name="name" defaultValue={user.name ?? ""} required />
          </Field>
          <Field label="Email">
            <StudioInput value={user.email ?? ""} readOnly disabled className="opacity-70" />
          </Field>
        </div>
      </StudioCard>

      {showAboutFields ? (
        <StudioCard
          title="Public team profile"
          description="Controls how you appear on /about#team when listed below is enabled."
        >
          <div className="grid gap-4">
            <Field label="Title on site" hint="e.g. Full Stack Developer · Project Lead">
              <StudioInput name="title" defaultValue={user.title ?? ""} placeholder="Your role line on About" />
            </Field>
            <Field label="Skills" hint="Comma separated · shown as tags on your card.">
              <StudioTextarea
                name="profileSkills"
                defaultValue={user.profileSkills?.join(", ") ?? ""}
                className="min-h-24"
                placeholder="Next.js, WordPress, React…"
              />
            </Field>
            <label className="flex items-start gap-2 text-sm leading-snug">
              <input type="checkbox" name="showOnAbout" defaultChecked={user.showOnAbout} className="mt-1" />
              <span>
                <span className="font-semibold text-[#15130f]">Show me on the About page</span>
                <span className="mt-0.5 block text-xs text-[#6f6a60]">
                  Only studio team members (founder, lead, developer) with this enabled appear in Meet The
                  Experts.
                </span>
              </span>
            </label>
          </div>
        </StudioCard>
      ) : null}

      <button
        type="submit"
        className="inline-flex items-center justify-center bg-[#15130f] px-5 py-2.5 text-[10px] font-bold tracking-[0.16em] text-white uppercase hover:bg-[#b8770a]"
      >
        Save profile
      </button>
    </form>
  );
}
