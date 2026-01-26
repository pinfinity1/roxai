import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginUser, loginWithGoogle } from "@/lib/api/auth/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

          // ✅ تغییر ۱: دریافت آبجکت user از پاسخ بک‌اند
          const { access_token, role, user } = response.data;

          if (access_token && user) {
            return {
              id: user.id,
              name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              email: user.email,
              image: user.avatar_url, // آواتار
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
      // این بخش فقط در لحظه لاگین اجرا می‌شود
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        // ✅ تغییر ۲: ذخیره نام و عکس در توکن
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
          const { access_token, role } = response.data;
          token.accessToken = access_token;
          token.role = role;
        } catch (error) {
          console.error("Google Sync Failed", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        // ✅ تغییر ۳: انتقال اطلاعات به سشن نهایی
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
