import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "brand" | "influencer" | null;
    } & DefaultSession["user"];
  }
}
