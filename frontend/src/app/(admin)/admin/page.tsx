import { StatsCards } from "@/features/admin/components/dashboard/stats-cards";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            داشبورد
          </h2>
          <p className="text-slate-500">
            نگاه کلی به وضعیت سلامت سیستم و کاربران
          </p>
        </div>
      </div>

      <Separator />

      {/* 1. Health Cards (Real Data) */}
      <StatsCards />

      {/* 2. Charts Placeholder (Coming Soon) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* نمودار رشد (جای خالی) */}
        <div className="col-span-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 h-[350px] flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <span className="text-2xl font-bold">📈</span>
          </div>
          <p className="text-sm font-medium">نمودار رشد کاربران</p>
          <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-600">
            به زودی
          </span>
        </div>

        {/* فعالیت‌های اخیر (جای خالی) */}
        <div className="col-span-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 h-[350px] flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <span className="text-2xl font-bold">⚡</span>
          </div>
          <p className="text-sm font-medium">فعالیت‌های اخیر سیستم</p>
          <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-600">
            به زودی
          </span>
        </div>
      </div>
    </div>
  );
}
