import Image from "next/image";
import Link from "next/link";
import { Github, Globe, Linkedin, Users } from "lucide-react";
import type { TeamMember } from "~/content/team";
import { appChip, appPanel } from "~/lib/surface";
import { cn } from "~/lib/utils";

type TeamGridProps = {
  members: TeamMember[];
};

export function TeamGrid({ members }: TeamGridProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {members.map((member, index) => (
        <div
          key={member.id ?? `${member.name}-${index}`}
          className={cn(
            appPanel,
            "w-full p-8 text-center sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]",
          )}
        >
          <div className="relative mx-auto mb-6 size-24 overflow-hidden rounded-full bg-gradient-to-br from-sc-accent-bright to-sc-accent">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Users className="size-12 text-white" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-black tracking-tight uppercase">{member.name}</h3>
          <p className="mt-2 text-[13px] font-semibold tracking-[0.12em] text-sc-accent uppercase">
            {member.role}
          </p>
          {member.bio ? (
            <p className="mt-4 text-sm leading-relaxed text-[#57524a]">{member.bio}</p>
          ) : null}
          {member.linkedinUrl || member.githubUrl || member.portfolioUrl ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {member.linkedinUrl ? (
                <Link
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-md bg-sc-section text-sc-ink ring-1 ring-[#15130f]/10 transition-colors hover:bg-sc-accent hover:text-white"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <Linkedin className="size-4" />
                </Link>
              ) : null}
              {member.githubUrl ? (
                <Link
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-md bg-sc-section text-sc-ink ring-1 ring-[#15130f]/10 transition-colors hover:bg-sc-accent hover:text-white"
                  aria-label={`${member.name} on GitHub`}
                >
                  <Github className="size-4" />
                </Link>
              ) : null}
              {member.portfolioUrl ? (
                <Link
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-md bg-sc-section text-sc-ink ring-1 ring-[#15130f]/10 transition-colors hover:bg-sc-accent hover:text-white"
                  aria-label={`${member.name} portfolio`}
                >
                  <Globe className="size-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className={appChip}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
