import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      role: string;
      mobile?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    mobile?: string | null;
    avatar_url?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    id?: string;
    picture?: string | null;
  }
}
