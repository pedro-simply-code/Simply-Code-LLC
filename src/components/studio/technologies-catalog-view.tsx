import type { StudioViewMode } from "~/lib/studio-view";
import { appPanel, appPanelHover } from "~/lib/surface";
import { cn } from "~/lib/utils";

type TechnologyRow = {
  id: string;
  name: string;
  category: string;
  developerCount: number;
  projectCount: number;
};

export function TechnologiesCatalogView({
  technologies,
  view,
}: {
  technologies: TechnologyRow[];
  view: StudioViewMode;
}) {
  if (technologies.length === 0) {
    return (
      <p className={cn(appPanel, "px-4 py-8 text-sm text-[#6f6a60]")}>
        No technologies yet. Use <strong>Add technology</strong> above.
      </p>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {technologies.map((technology) => (
          <article
            key={technology.id}
            className={cn(appPanel, appPanelHover, "p-4")}
          >
            <p className="font-semibold">{technology.name}</p>
            <p className="mt-1 text-[11px] text-[#6f6a60]">
              {technology.category}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">
                  Devs
                </dt>
                <dd className="mt-0.5 text-[#57524a]">
                  {technology.developerCount}
                </dd>
              </div>
              <div>
                <dt className="font-bold tracking-[0.1em] text-[#9a9488] uppercase">
                  Projects
                </dt>
                <dd className="mt-0.5 text-[#57524a]">
                  {technology.projectCount}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(appPanel, "overflow-x-auto")}>
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-sc-section-alt border-b border-[#15130f]/12">
          <tr className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
            <th className="px-4 py-3">Technology</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Developers</th>
            <th className="px-4 py-3">Projects</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#15130f]/10">
          {technologies.map((technology) => (
            <tr key={technology.id}>
              <td className="px-4 py-3 font-semibold">{technology.name}</td>
              <td className="px-4 py-3 text-[#57524a]">
                {technology.category}
              </td>
              <td className="px-4 py-3 text-[#57524a]">
                {technology.developerCount}
              </td>
              <td className="px-4 py-3 text-[#57524a]">
                {technology.projectCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
