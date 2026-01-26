import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// این خط به طور خودکار تابع authorized را از authConfig اجرا می‌کند
export default NextAuth(authConfig).auth;

export const config = {
  // مچر: همه روت‌ها به جز فایل‌های استاتیک و api
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
