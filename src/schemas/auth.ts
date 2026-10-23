import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const inviteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["founder", "lead", "developer", "client"]).default("developer"),
  title: z.string().trim().max(120).optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().trim().min(1, "Invitation token is required"),
  name: z.string().trim().min(1, "Name is required").max(120),
  password: passwordSchema,
});

export const clientInviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

export type InviteInput = z.infer<typeof inviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
