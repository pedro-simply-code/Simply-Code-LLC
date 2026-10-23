import type { Project } from "~/server/db/schema";
import type { UserRole } from "~/server/db/schema";
import { MultiSelect } from "~/components/studio/multi-select";
import { ProjectCoverUpload } from "~/components/studio/project-cover-upload";
import { Field, StudioCard, StudioInput, StudioSelect, StudioTextarea } from "~/components/studio/ui";

type Person = { id: string; name: string | null; email: string | null; role: UserRole };
type Technology = { id: string; name: string; category: string };
type Client = { id: string; name: string };

export function ProjectForm({
  action,
  project,
  team,
  technologies,
  clients,
  leadId,
  memberIds = [],
  technologyIds = [],
  canChooseLead = true,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: Project;
  team: Person[];
  technologies: Technology[];
  clients: Client[];
  leadId?: string;
  memberIds?: string[];
  technologyIds?: string[];
  canChooseLead?: boolean;
}) {
  const isEdit = Boolean(project);
  const submitLabel = isEdit ? "Save changes" : "Create project";

  return (
    <form action={action} className="space-y-6">
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}

      <section className="border border-[#15130f]/12 bg-white p-5 md:p-6">
        <Field label="Title">
          <StudioInput
            name="title"
            defaultValue={project?.title}
            required
            placeholder="Project name"
            className="border-0 border-b border-[#15130f]/20 px-0 py-2 text-2xl font-bold tracking-tight focus:border-[#b8770a]"
          />
        </Field>

        <div className="mt-5 grid gap-5 pt-1 md:grid-cols-2">
          <Field label="Permalink" hint="Leave blank to generate from the title." className="md:col-span-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#6f6a60]">
              <span className="shrink-0 font-mono text-xs">/work/</span>
              <StudioInput
                name="slug"
                defaultValue={project?.slug}
                placeholder="harmony"
                className="min-w-0 flex-1 font-mono text-sm"
              />
            </div>
          </Field>
          <Field label="Live URL" hint="Deployed site." className="md:col-span-1">
            <StudioInput
              name="liveUrl"
              defaultValue={project?.liveUrl ?? ""}
              placeholder="https://"
            />
          </Field>
        </div>
      </section>

      <div
        className="sticky top-20 z-10 -mx-1 flex flex-wrap items-center justify-end gap-3 border-b border-[#15130f]/10 bg-[#f7f4ee]/95 px-1 py-3 backdrop-blur-sm"
      >
        <button
          type="submit"
          className="inline-flex items-center justify-center bg-[#15130f] px-5 py-2.5 text-[10px] font-bold tracking-[0.16em] text-white uppercase hover:bg-[#b8770a]"
        >
          {submitLabel}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start">
        <div className="space-y-6">
          <StudioCard
            title="About this project"
            description="Shown on the work grid, project page, and search previews."
          >
            <Field label="Summary">
              <StudioTextarea
                name="summary"
                defaultValue={project?.summary}
                className="min-h-40"
                placeholder="What you built, who it was for, and what mattered most."
              />
            </Field>
          </StudioCard>

          <div className="grid gap-6 md:grid-cols-2">
            <StudioCard title="Stack">
              <Field as="div" label="Technologies" hint="Search and select.">
                <MultiSelect
                  name="technologyIds"
                  ariaLabel="Technologies"
                  defaultValue={technologyIds}
                  placeholder="Add technologies…"
                  searchPlaceholder="Search…"
                  emptyText="No technologies found."
                  options={technologies.map((technology) => ({
                    value: technology.id,
                    label: technology.name,
                    description: technology.category,
                  }))}
                />
              </Field>
            </StudioCard>

            <StudioCard title="Client">
              <div className="grid gap-4">
                <Field label="Client name">
                  <StudioInput name="clientName" defaultValue={project?.clientName} />
                </Field>
                <Field label="Portal account" hint="Optional client login.">
                  <StudioSelect name="clientId" defaultValue={project?.clientId ?? ""}>
                    <option value="">No portal account</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </StudioSelect>
                </Field>
              </div>
            </StudioCard>
          </div>

          {!isEdit && canChooseLead ? (
            <StudioCard title="Team" description="Assign a lead and developers for the new project.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Project lead" hint="Receives project email and controls the project.">
                  <StudioSelect name="leadId" defaultValue={leadId ?? ""}>
                    <option value="">Unassigned (founder receives email)</option>
                    {team.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name ?? person.email}
                      </option>
                    ))}
                  </StudioSelect>
                </Field>
                <Field as="div" label="Developers" hint="Choose one or more team members.">
                  <MultiSelect
                    name="memberIds"
                    ariaLabel="Developers"
                    defaultValue={memberIds}
                    placeholder="Add developers…"
                    searchPlaceholder="Search team…"
                    emptyText="No team members found."
                    options={team.map((person) => ({
                      value: person.id,
                      label: person.name ?? person.email ?? "Unnamed",
                      description: person.name ? (person.email ?? undefined) : undefined,
                    }))}
                  />
                </Field>
              </div>
            </StudioCard>
          ) : null}
        </div>

        <aside className="space-y-5 self-start lg:sticky lg:top-36">
          <StudioCard title="Cover">
            <ProjectCoverUpload defaultUrl={project?.image} />
          </StudioCard>

          <StudioCard title="Publishing">
            <div className="grid gap-3">
              <Field label="Status">
                <StudioSelect name="status" defaultValue={project?.status ?? "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                </StudioSelect>
              </Field>
              <label className="flex items-center gap-2 text-xs leading-snug">
                <input type="checkbox" name="featured" defaultChecked={project?.featured} />
                Feature on home
              </label>
            </div>
          </StudioCard>
        </aside>
      </div>
    </form>
  );
}
