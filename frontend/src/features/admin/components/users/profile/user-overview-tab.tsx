"use client";

import { AdminUserListItem } from "@/lib/api/model";
import { useAdminListProjects } from "@/lib/api/admin-console/admin-console";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wallet, Shield, Layers, Calendar, Activity } from "lucide-react";
// دکمه‌ها و دیالوگ‌ها را حذف کردیم چون در سایدبار هستند

interface UserOverviewTabProps {
  user: AdminUserListItem;
  onRefresh: () => void;
}

export function UserOverviewTab({ user }: UserOverviewTabProps) {
  const { data: projectsData, isLoading: isProjectsLoading } =
    useAdminListProjects({
      page: 1,
      page_size: 1,
      user_id: user.id,
    });

  const stats = [
    {
      label: "تعداد پروژه‌ها",
      value: isProjectsLoading ? "..." : projectsData?.total || 0,
      icon: Layers,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "اعتبار فعلی",
      value: user.credit?.toLocaleString() || "0",
      suffix: "تومان",
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "تاریخ عضویت",
      value: new Date(user.created_at).toLocaleDateString("fa-IR"),
      icon: Calendar,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "نقش کاربری",
      value: user.role.toUpperCase(),
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 mt-6">
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm border border-slate-200">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`p-2 rounded-full ${stat.bg} ${stat.color} mb-1`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-lg font-bold text-slate-900 dir-ltr">
                {stat.value}{" "}
                <span className="text-[10px] font-normal text-slate-500">
                  {stat.suffix}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Details Card */}
        <Card className="border-slate-200 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">
              اطلاعات تکمیلی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-muted-foreground text-xs">موبایل</span>
              <span className="font-mono font-medium text-slate-900 dir-ltr">
                {user.mobile || "---"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-muted-foreground text-xs">ایمیل</span>
              <span
                className="font-mono font-medium text-slate-900 truncate max-w-[200px]"
                title={user.email || ""}
              >
                {user.email || "---"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground text-xs">وضعیت تایید</span>
              <div
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
              >
                {user.is_verified ? "Verified" : "Pending"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. جایگزینی دکمه‌ها با "وضعیت سلامت" یا "فعالیت اخیر" */}
        <Card className="border-slate-200 shadow-sm h-full bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              وضعیت لحظه‌ای
            </CardTitle>
            <CardDescription className="text-xs">
              خلاصه‌ای از وضعیت فنی اکانت کاربر
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* این بخش می‌تواند بعداً به API واقعی وصل شود */}
            <div className="flex items-center justify-between text-sm bg-white p-3 rounded border border-slate-100">
              <span className="text-slate-500">آخرین لاگین</span>
              <span className="font-mono text-xs">2 ساعت پیش</span>
            </div>
            <div className="flex items-center justify-between text-sm bg-white p-3 rounded border border-slate-100">
              <span className="text-slate-500">IP ثبت‌نام</span>
              <span className="font-mono text-xs">192.168.1.1 (Tehran)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
