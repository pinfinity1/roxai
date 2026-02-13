import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 👇 1. این دو تابع حیاتی هستند تا میدل‌ور بتواند role را ببیند
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    // 👆 پایان بخش اضافه شده

    // 👇 2. حالا authorized می‌تواند role را بخواند
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // الان auth.user.role مقدار دارد!
      // @ts-ignore
      const userRole = auth?.user?.role;

      const isOnDashboard = nextUrl.pathname.startsWith("/");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuth = nextUrl.pathname === "/login";

      // محافظت از ادمین
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (userRole !== "admin" && userRole !== "support") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // محافظت از داشبورد
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      // ریدایرکت از لاگین
      if (isOnAuth && isLoggedIn) {
        if (userRole === "admin" || userRole === "support") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
