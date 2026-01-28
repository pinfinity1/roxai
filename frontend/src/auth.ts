import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginUser, loginWithGoogle } from "@/lib/api/auth/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  pages: {
    signIn: "/login",
    error: "/login/error",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.identifier || !credentials?.password) return null;

          const response = await loginUser({
            identifier: credentials.identifier as string,
            password: credentials.password as string,
          });

          const { access_token, role, user } = response.data;

          if (access_token && user) {
            return {
              id: user.id,
              name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              email: user.email,
              image: user.avatar_url,
              accessToken: access_token,
              role: role,
            };
          }
          return null;
        } catch (error) {
          console.error("Login Failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.name = user.name;
        token.picture = user.image;
      }

      if (account && account.provider === "google") {
        try {
          const response = await loginWithGoogle({
            id_token: account.id_token as string,
          });
          // در لاگین گوگل هم باید اطلاعات کاربر را بگیریم (اگر بک‌اند بفرستد)
          // فعلاً فقط توکن و نقش را آپدیت می‌کنیم
          const { access_token, role, user } = response.data;
          token.accessToken = access_token;
          token.role = role;
          if (user && user.avatar_url) {
            token.picture = user.avatar_url;
            token.name = `${user.first_name} ${user.last_name}`;
          }
        } catch (error) {
          console.error("Google Sync Failed", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
