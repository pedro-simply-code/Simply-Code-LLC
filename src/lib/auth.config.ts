import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "~/env";
import { refreshAuthTokenFromDb } from "~/lib/auth-token-refresh";
import { normalizeRole } from "~/lib/roles";
import type { UserRole } from "~/server/db/schema";

const google =
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        // Invite-only: the founder has already approved the email address.
        // Google verifies ownership, so linking it to the invited account is safe.
        allowDangerousEmailAccountLinking: true,
        // Restrict to a Google Workspace domain when configured.
        ...(env.AUTH_GOOGLE_HD ? { hd: env.AUTH_GOOGLE_HD } : {}),
      })
    : null;

/**
 * Edge-safe Auth.js config (middleware). Database adapter and Credentials live in `auth.ts`.
 */
export default {
  providers: google ? [google] : [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.role) token.role = normalizeRole(user.role);
        token.totpRequired = !!(user as { totpRequired?: boolean })
          .totpRequired;
      }
      return refreshAuthTokenFromDb(token);
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = normalizeRole(token.role as UserRole | undefined);
        session.totpRequired = !!token.totpRequired;
      }
      return session;
    },
  },
  // Auth.js validates the incoming Host header even when AUTH_URL is set.
  // Keep trusting the proxy-provided host in every environment.
  trustHost: true,
} satisfies NextAuthConfig;
