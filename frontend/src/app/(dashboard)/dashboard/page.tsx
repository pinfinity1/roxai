// frontend/src/app/(dashboard)/dashboard/page.tsx
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // اگر کاربر لاگین نبود، به صفحه ورود برگرد
  if (!session) {
    redirect("/login");
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-vazir"
      dir="rtl"
    >
      <div className="w-full max-w-3xl space-y-6">
        {/* --- هدر خوش‌آمدگویی --- */}
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold text-gray-800">داشبورد مدیریت</h1>
          <Badge variant="outline" className="bg-white">
            نسخه ۱.۰.۰
          </Badge>
        </div>

        {/* --- کارت اطلاعات کاربر --- */}
        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardHeader className="flex flex-row items-center gap-6 pb-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage
                src={session?.user?.image || ""}
                alt={session?.user?.name || ""}
              />
              <AvatarFallback className="text-2xl font-bold bg-gray-900 text-white">
                {session?.user?.email?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <div>
                <CardTitle className="text-2xl font-black text-gray-900">
                  {session?.user?.name || "کاربر ناشناس"}
                </CardTitle>
                <CardDescription className="text-base text-gray-500 font-mono mt-1">
                  {session?.user?.email}
                </CardDescription>
              </div>

              <div className="flex gap-2 mt-1">
                {/* ✅ اصلاح شرط: بررسی role با حروف کوچک */}
                <Badge
                  className="px-3 py-1 text-xs"
                  variant={
                    session?.user?.role === "admin"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  نقش: {session?.user?.role?.toUpperCase() || "USER"}
                </Badge>

                <Badge variant="outline" className="text-xs">
                  {session?.user?.image ? "Google Account" : "Credentials"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 bg-gray-50/50 py-6 border-y border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <span className="text-muted-foreground text-xs">
                  شناسه کاربر (ID):
                </span>
                <span className="font-mono text-xs text-gray-700 break-all">
                  {session?.user?.id || "---"}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <span className="text-muted-foreground text-xs">
                  وضعیت احراز هویت:
                </span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-green-700 font-medium text-xs">
                    توکن معتبر است
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between px-6 py-5 bg-white rounded-b-xl">
            <p className="text-xs text-gray-400">
              سشن به صورت ایمن برقرار است.
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                خروج از حساب
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* --- بخش دیباگ فنی (برای دولوپر) --- */}
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-gray-500 flex items-center gap-2">
              <span>🛠 Session Dump</span>
              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                Dev Only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="w-full overflow-x-auto rounded-lg bg-gray-900 p-4 text-[10px] leading-relaxed text-green-400 font-mono shadow-inner border border-gray-800"
              dir="ltr"
            >
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
