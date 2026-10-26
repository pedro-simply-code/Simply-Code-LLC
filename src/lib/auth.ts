import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "~/lib/auth.config";
import { refreshAuthTokenFromDb } from "~/lib/auth-token-refresh";
import { isFounder, normalizeRole } from "~/lib/roles";
import { loginSchema } from "~/schemas/auth";
import type { UserRole } from "~/server/db/schema";
import { verifyPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import { accounts, sessions, users, verificationTokens } from "~/server/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.role) token.role = normalizeRole(user.role as UserRole);
        token.name = user.name;
        token.picture = user.image;
        token.totpRequired = !!(user as { totpRequired?: boolean }).totpRequired;
      }
      return refreshAuthTokenFromDb(token);
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = normalizeRole(token.role as UserRole | undefined);
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
        session.totpRequired = !!token.totpRequired;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Public registration is closed. Google may only sign in accounts that
      // already exist (created through a founder invitation).
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true },
      });
      if (!existing) {
        console.warn("[auth] Blocked Google sign-in for an email without an account", email);
        return false;
      }
      return true;
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const row = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!row?.passwordHash) return null;

        const valid = await verifyPassword(parsed.data.password, row.passwordHash);
        if (!valid) return null;

        return {
          id: row.id,
          email: row.email ?? email,
          name: row.name,
          image: row.image,
          role: row.role,
          totpRequired: isFounder(row.role) && row.totpEnabled,
        };
      },
    }),
  ],
});
