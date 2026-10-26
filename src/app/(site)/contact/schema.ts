import { z } from "zod";

const SERVICE_VALUES = [
  "ux-design",
  "full-stack",
  "wordpress-development",
  "agency-partnerships",
  "other",
] as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "That name is too long."),
  email: z.email("Please enter a valid email address.").max(200),
  company: z
    .string()
    .trim()
    .max(160, "That company name is too long.")
    .optional(),
  service: z.enum(SERVICE_VALUES, { error: "Please choose a service." }),
  message: z
    .string()
    .trim()
    .min(20, "Please add a little more detail (at least 20 characters).")
    .max(5000, "That message is too long."),
  website: z.string().max(0, "Spam detected.").optional(),
  startedAt: z.string().optional(),
});

export type ContactField = "name" | "email" | "company" | "service" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string[]>>;
};

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle" };
