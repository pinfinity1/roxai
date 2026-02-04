"use client";

import { useGetSystemHealth } from "@/lib/api/admin-console/admin-console";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { HealthStats } from "./health-stats";
import { ServicesStatus } from "./services-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HealthDashboardView() {
  const { data, isLoading, refetch, isRefetching } = useGetSystemHealth({
    query: {
      refetchInterval: 10000, // آپدیت خودکار هر ۱۰ ثانیه
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            وضعیت سلامت سیستم
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            مانیتورینگ لحظه‌ای منابع، دیتابیس و صف‌های پردازشی
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          بروزرسانی
        </Button>
      </div>

      {/* Stats Grid */}
      <HealthStats data={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status List */}
        <ServicesStatus data={data} isLoading={isLoading} />

        {/* System Logs Placeholder (یا چارت لود سیستم در آینده) */}
        <Card className="border-slate-200 shadow-sm border-dashed bg-slate-50/50 flex flex-col justify-center items-center text-muted-foreground p-6">
          <CardHeader className="text-center p-0 mb-4">
            <CardTitle className="text-base">نمودار منابع سیستم</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-center">
            این بخش در نسخه‌های بعدی با نمودارهای گرافانا یا Recharts جایگزین
            خواهد شد.
            <br />
            (CPU / Memory Usage History)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
