import type { DefaultSession } from "next-auth";
import type { UserRole } from "~/server/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
    totpRequired?: boolean;
  }

  interface User {
    role?: UserRole;
    totpRequired?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    totpRequired?: boolean;
  }
}
