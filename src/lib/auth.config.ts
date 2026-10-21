import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "~/env";

const google =
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: false,
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
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.role) token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
