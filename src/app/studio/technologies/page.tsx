import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import {
  assignUserTechnology,
  createTechnology,
  removeUserTechnology,
} from "~/server/studio/actions";
import { getTeamUsers, getTechnologies, getTechnologyAssignments } from "~/server/studio/queries";
import {
  Field,
  StudioCard,
  StudioHeader,
  StudioInput,
  StudioSelect,
} from "~/components/studio/ui";

export const dynamic = "force-dynamic";

export default async function TechnologiesPage() {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const [technologies, team] = await Promise.all([getTechnologies(), getTeamUsers()]);
  const assignments = await Promise.all(
    team.map(async (person) => ({
      person,
      skills: await getTechnologyAssignments(person.id),
    })),
  );

  return (
    <div>
      <StudioHeader
        title="Technologies"
        description="Add the stack the studio works with, then assign each technology to the developers who know it."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioCard title="Add technology">
          <form action={createTechnology} className="grid gap-4">
            <Field label="Name">
              <StudioInput name="name" placeholder="Python" required />
            </Field>
            <Field label="Category">
              <StudioInput name="category" placeholder="Backend" />
            </Field>
            <button
              type="submit"
              className="w-fit bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              Add technology
            </button>
          </form>
        </StudioCard>

        <StudioCard title="Assign to a developer">
          <form action={assignUserTechnology} className="grid gap-4">
            <Field label="Person">
              <StudioSelect name="userId" required>
                <option value="">Select person</option>
                {team.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name ?? person.email}
                  </option>
                ))}
              </StudioSelect>
            </Field>
            <Field label="Technology">
              <StudioSelect name="technologyId" required>
                <option value="">Select technology</option>
                {technologies.map((technology) => (
                  <option key={technology.id} value={technology.id}>
                    {technology.name}
                  </option>
                ))}
              </StudioSelect>
            </Field>
            <Field label="Level">
              <StudioSelect name="level" defaultValue="practicing">
                <option value="learning">Learning</option>
                <option value="practicing">Practicing</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </StudioSelect>
            </Field>
            <button
              type="submit"
              className="w-fit bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase hover:bg-[#b8770a]"
            >
              Assign technology
            </button>
          </form>
        </StudioCard>
      </div>

      <div className="mt-6 overflow-x-auto border border-[#15130f]/12 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-[#15130f]/12 bg-[#f7f4ee]">
            <tr className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
              <th className="px-4 py-3">Technology</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Developers</th>
              <th className="px-4 py-3">Projects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15130f]/10">
            {technologies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-sm text-[#6f6a60]">
                  No technologies yet. Add the first one above.
                </td>
              </tr>
            ) : (
              technologies.map((technology) => (
                <tr key={technology.id}>
                  <td className="px-4 py-3 font-semibold">{technology.name}</td>
                  <td className="px-4 py-3 text-[#57524a]">{technology.category}</td>
                  <td className="px-4 py-3 text-[#57524a]">{technology.developerCount}</td>
                  <td className="px-4 py-3 text-[#57524a]">{technology.projectCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {assignments.map(({ person, skills }) => (
          <StudioCard key={person.id} title={person.name ?? person.email ?? "Team member"}>
            {skills.length === 0 ? (
              <p className="text-sm text-[#6f6a60]">No technologies assigned.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li
                    key={skill.technologyId}
                    className="flex items-center gap-2 border border-[#15130f]/15 px-2.5 py-1 text-[11px]"
                  >
                    <span>
                      {skill.name} <span className="text-[#9a9488]">({skill.level})</span>
                    </span>
                    <form action={removeUserTechnology}>
                      <input type="hidden" name="userId" value={person.id} />
                      <input type="hidden" name="technologyId" value={skill.technologyId} />
                      <button
                        type="submit"
                        aria-label={`Remove ${skill.name}`}
                        className="text-[#9a3b2e] hover:underline"
                      >
                        ×
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </StudioCard>
        ))}
      </div>
    </div>
  );
}
