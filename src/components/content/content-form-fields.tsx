import {
  Field,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "~/components/studio/ui";
import {
  CONTENT_KINDS,
  CONTENT_KIND_LABEL,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABEL,
  type ContentKindName,
  type ContentStatusName,
} from "~/lib/content";

export function ContentFormFields({
  kind = "page",
  status = "draft",
  title = "",
  slug = "",
  excerpt = "",
  coverImageUrl = "",
}: {
  kind?: ContentKindName;
  status?: ContentStatusName;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Title" className="md:col-span-2">
        <StudioInput name="title" defaultValue={title} required />
      </Field>
      <Field
        label="Slug"
        hint="Leave empty to generate it from the title. Reserved routes are rejected."
      >
        <StudioInput name="slug" defaultValue={slug} placeholder="about-us" />
      </Field>
      <Field label="Type">
        <StudioSelect name="kind" defaultValue={kind}>
          {CONTENT_KINDS.map((value) => (
            <option key={value} value={value}>
              {CONTENT_KIND_LABEL[value]}
            </option>
          ))}
        </StudioSelect>
      </Field>
      <Field label="Status">
        <StudioSelect name="status" defaultValue={status}>
          {CONTENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CONTENT_STATUS_LABEL[value]}
            </option>
          ))}
        </StudioSelect>
      </Field>
      <Field
        label="Cover image URL"
        hint="Optional. Used in cards and social previews."
      >
        <StudioInput
          name="coverImageUrl"
          type="url"
          defaultValue={coverImageUrl}
          placeholder="https://…"
        />
      </Field>
      <Field
        label="Excerpt"
        hint="Shown in the listing and used as the meta description."
        className="md:col-span-2"
      >
        <StudioTextarea
          name="excerpt"
          defaultValue={excerpt}
          className="min-h-20"
        />
      </Field>
    </div>
  );
}
