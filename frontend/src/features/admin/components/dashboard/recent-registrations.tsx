"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useListUsers } from "@/lib/api/admin-console/admin-console";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentRegistrations() {
  // ✅ دریافت ۵ کاربر اخیر
  const { data } = useListUsers({
    // فرض بر این است که API سورت پیش‌فرضش روی created_at desc است یا پارامتر سورت دارد
    // اگر API پارامتر سورت ندارد، فعلاً ۵ تای اول صفحه ۱ را می‌گیریم
    page: 1,
    page_size: 5,
  });

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-bold">آخرین ثبت‌نام‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data?.items?.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="font-mono text-xs">
                    {(user.email || user.mobile || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.first_name || "کاربر"} {user.last_name || ""}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {user.email || user.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={user.role === "admin" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {user.role}
                </Badge>
                <span className="text-xs text-gray-400 font-mono" dir="ltr">
                  {new Date(user.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
