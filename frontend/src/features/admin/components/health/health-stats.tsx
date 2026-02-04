"use client";

import { SystemHealthResponse } from "@/lib/api/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Database,
  Users,
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthStatsProps {
  data?: SystemHealthResponse;
  isLoading: boolean;
}

export function HealthStats({ data, isLoading }: HealthStatsProps) {
  // پارس کردن لود سیستم (معمولاً به صورت "0.15 0.20 0.10" می‌آید)
  const loadValue = parseFloat(data?.system_load?.split(" ")[0] || "0");
  const isHighLoad = loadValue > 2.0;

  const stats = [
    {
      label: "کاربران کل",
      value: data?.total_users.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      statusColor: "bg-blue-500",
    },
    {
      label: "کاربران فعال (۲۴س)",
      value: data?.active_users_24h.toLocaleString(),
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      statusColor: "bg-emerald-500",
    },
    {
      label: "صف پردازش (Jobs)",
      value: data?.pending_jobs_count.toLocaleString(),
      icon: Clock,
      // اگر صف شلوغ باشد رنگ هشدار می‌گیرد
      color:
        (data?.pending_jobs_count || 0) > 50
          ? "text-orange-600"
          : "text-slate-600",
      bg:
        (data?.pending_jobs_count || 0) > 50 ? "bg-orange-50" : "bg-slate-100",
      statusColor:
        (data?.pending_jobs_count || 0) > 50 ? "bg-orange-500" : "bg-slate-400",
    },
    {
      label: "بار سیستم (Load)",
      value: loadValue.toFixed(2),
      icon: Server,
      color: isHighLoad ? "text-rose-600" : "text-indigo-600",
      bg: isHighLoad ? "bg-rose-50" : "bg-indigo-50",
      statusColor: isHighLoad ? "bg-rose-500" : "bg-indigo-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="border-slate-200 shadow-sm overflow-hidden relative"
        >
          {/* نوار رنگی وضعیت سمت راست */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-1",
              stat.statusColor,
            )}
          />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-4 pr-6">
            <CardTitle className="text-xs font-bold text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", stat.bg)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
          </CardHeader>
          <CardContent className="pl-4 pr-6 pb-4">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
