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

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* --- کارت اطلاعات کاربر --- */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {/* اگر عکس باشد (مثل گوگل) نمایش می‌دهد، اگر نباشد حروف اول اسم را می‌سازد */}
              <AvatarImage
                src={session?.user?.image || ""}
                alt={session?.user?.name || ""}
              />
              <AvatarFallback className="text-xl font-bold">
                {session?.user?.name?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold">
                {session?.user?.name || "کاربر بدون نام"}
              </CardTitle>
              <CardDescription className="text-base">
                {session?.user?.email}
              </CardDescription>
              <div className="mt-2 flex gap-2">
                {/* نمایش نقش کاربر اگر در سشن موجود باشد */}
                <Badge
                  variant={
                    session?.user?.role === "ADMIN" ? "destructive" : "default"
                  }
                >
                  نقش: {session?.user?.role || "نامشخص"}
                </Badge>

                {/* نمایش نوع ورود (تشخیص ساده) */}
                <Badge variant="outline">
                  {session?.user?.image
                    ? "ورود با گوگل (احتمالی)"
                    : "ورود دستی"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">شناسه کاربر (ID):</span>
                <span className="font-mono text-xs bg-gray-100 p-1 rounded">
                  {session?.user?.id || "ناموجود"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">وضعیت توکن:</span>
                <span className="text-green-600 font-medium">فعال ✅</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              زمان انقضای نشست: به صورت خودکار تمدید می‌شود
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="destructive" size="sm">
                خروج از حساب
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* --- بخش دیباگ فنی (نمایش کل اطلاعات) --- */}
        <Card className="border-dashed border-2 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">
              🛠 جعبه ابزار توسعه‌دهنده (Raw Session)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="w-full overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-green-400"
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
