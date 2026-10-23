import { redirect } from "next/navigation";
import { StudioHeader } from "~/components/studio/ui";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";
import { getContactMessages } from "~/server/studio/queries";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await auth();
  if (!isFounder(session?.user.role)) redirect("/studio");

  const messages = await getContactMessages();

  return (
    <div>
      <StudioHeader
        title="Contact messages"
        description="Enquiries from the public contact form. Only founders see these; project email stays separate."
      />

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="border border-dashed border-[#15130f]/20 p-8 text-sm text-[#6f6a60]">
            No contact messages yet.
          </p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="border border-[#15130f]/12 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold">{message.name}</h2>
                  <p className="mt-0.5 text-[11px] text-[#6f6a60]">
                    {message.email}
                    {message.company ? ` · ${message.company}` : ""}
                    {message.service ? ` · ${message.service}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-[#9a9488] uppercase">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your project enquiry")}`}
                    className="border border-[#15130f]/20 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase hover:border-[#b8770a]"
                  >
                    Reply
                  </a>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[#57524a]">
                {message.message}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
