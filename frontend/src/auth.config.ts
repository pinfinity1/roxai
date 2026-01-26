import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // هدایت کاربر لاگین نشده به این صفحه
  },
  callbacks: {
    // این تابع در میدل‌ور اجرا می‌شود تا اجازه دسترسی را چک کند
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLoginPage = nextUrl.pathname === "/login";

      // ۱. اگر کاربر در داشبورد است
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // خودکار ریدایرکت می‌کند به /login
      }

      // ۲. اگر کاربر لاگین است و در صفحه لاگین است
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // در اینجا خالی می‌گذاریم تا حجم کم بماند
} satisfies NextAuthConfig;
