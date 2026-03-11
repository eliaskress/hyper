import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  providers: [
    // Instagram OAuth — stubbed for development
    // To test locally, use the Credentials provider below
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: "https://api.instagram.com/oauth/authorize",
      token: "https://api.instagram.com/oauth/access_token",
      userinfo: "https://graph.instagram.com/me?fields=id,username",
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          image: null,
        };
      },
    },
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnApi = nextUrl.pathname.startsWith("/api/campaigns") || nextUrl.pathname.startsWith("/api/applications");

      if (isOnDashboard || isOnApi) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
