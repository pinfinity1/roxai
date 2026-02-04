"use client";

import { StatsCards } from "./stats-cards";
import { RecentRegistrations } from "./recent-registrations";
// اگر نموداری اضافه کردیم ایمپورت می‌کنیم، فعلاً جای خالی می‌گذاریم

export function AdminDashboardView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">
            داشبورد
          </h2>
          <p className="text-muted-foreground mt-1">
            نگاه کلی به وضعیت سیستم و کاربران Roxai
          </p>
        </div>
      </div>

      {/* 2. Key Metrics (Live) */}
      <StatsCards />

      {/* 3. Main Content Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* بخش نمودارها (جایگاه ۴ ستون) - فعلاً Placeholder */}
        <div className="col-span-1 lg:col-span-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[300px]">
          <span className="text-gray-400 text-sm">
            نمودار رشد کاربران (به زودی)
          </span>
        </div>

        {/* بخش آخرین فعالیت‌ها (جایگاه ۳ ستون) */}
        <RecentRegistrations />
      </div>
    </div>
  );
}
