import { Field, StudioInput } from "~/components/studio/ui";
import { contentSlugPrefix, type ContentKindName } from "~/lib/content";

export function ContentFormHeader({
  title = "",
  slug = "",
  kind = "page",
}: {
  title?: string;
  slug?: string;
  kind?: ContentKindName;
}) {
  const prefix = contentSlugPrefix(kind);

  return (
    <>
      <Field label="Title">
        <StudioInput
          name="title"
          defaultValue={title}
          required
          placeholder="Page or post title"
          className="focus:border-sc-accent rounded-none border-0 border-b border-[#15130f]/20 bg-transparent px-0 py-1 text-lg font-semibold tracking-tight whitespace-nowrap shadow-none ring-0 focus:shadow-none focus:ring-0"
        />
      </Field>

      <div className="mt-5 pt-1">
        <Field
          label="Slug"
          hint="Leave empty to generate from the title."
        >
          <div className="flex w-full min-w-0 items-center gap-2 text-sm text-[#6f6a60]">
            <span className="shrink-0 font-mono text-xs">{prefix}</span>
            <StudioInput
              name="slug"
              defaultValue={slug}
              placeholder="about-us"
              className="min-w-0 flex-1 font-mono text-sm"
            />
          </div>
        </Field>
      </div>
    </>
  );
}
