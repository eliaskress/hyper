import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const config: NextAuthConfig = {
  providers: [
    Credentials({
      id: "demo-login",
      name: "Demo Login",
      credentials: {
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const role = credentials?.role as string;
        if (role === "brand") {
          return {
            id: "demo-brand-001",
            name: "Bacio di Latte",
            email: "demo-brand@hyper.local",
            role: "brand",
          };
        }
        if (role === "influencer") {
          return {
            id: "demo-creator-001",
            name: "Maria Santos",
            email: "demo-creator@hyper.local",
            role: "influencer",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnApi =
        nextUrl.pathname.startsWith("/api/campaigns") ||
        nextUrl.pathname.startsWith("/api/applications");

      if (isOnDashboard || isOnApi) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "brand" | "influencer" | null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
