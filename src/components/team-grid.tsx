import Image from "next/image";
import { Users } from "lucide-react";
import { TEAM, type TeamMember } from "~/content/team";

type TeamGridProps = {
  members?: TeamMember[];
};

export function TeamGrid({ members = TEAM }: TeamGridProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {members.map((member) => (
        <div
          key={`${member.name}-${member.role}`}
          className="w-full border border-[#15130f]/12 bg-white p-8 text-center sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
        >
          <div className="relative mx-auto mb-6 size-24 overflow-hidden rounded-full bg-gradient-to-br from-[#f0a500] to-[#e2761b]">
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
          <p className="mt-2 text-[13px] font-semibold tracking-[0.12em] text-[#b8770a] uppercase">
            {member.role}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[#15130f]/20 px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase"
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
