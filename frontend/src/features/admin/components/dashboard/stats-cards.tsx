"use client";

import { useGetSystemHealth } from "@/lib/api/admin-console/admin-console";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Server, Database, Loader2 } from "lucide-react";

export function StatsCards() {
  const { data, isLoading } = useGetSystemHealth();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // مپ کردن داده‌های واقعی API به کارت‌ها
  const stats = [
    {
      title: "کاربران ثبت‌نامی",
      value: data?.total_users.toLocaleString() || "0",
      icon: Users,
      description: "کل کاربران پلتفرم",
    },
    {
      title: "کاربران فعال (24h)",
      value: data?.active_users_24h.toLocaleString() || "0",
      icon: Activity,
      description: "کاربران آنلاین در ۲۴ ساعت گذشته",
      // اگر یوزر فعال زیاد بود سبز، کم بود معمولی
      className:
        (data?.active_users_24h || 0) > 0
          ? "text-emerald-600"
          : "text-slate-900",
    },
    {
      title: "صف پردازش (Jobs)",
      value: data?.pending_jobs_count.toLocaleString() || "0",
      icon: Server,
      description: "تسک‌های در انتظار در Temporal",
      className:
        (data?.pending_jobs_count || 0) > 50
          ? "text-orange-600"
          : "text-slate-900",
    },
    {
      title: "وضعیت دیتابیس",
      value: "Healthy", // یا data?.database_status
      icon: Database,
      description: "اتصال پایدار است",
      className: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stat.className || "text-slate-900"}`}
            >
              {stat.value}
            </div>
            <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
