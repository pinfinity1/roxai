"use client";

import { useGetUserAuditLogs } from "@/lib/api/admin-console/admin-console";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  ShieldAlert,
  UserCog,
  Wallet,
  ScrollText,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserAuditLogsProps {
  userId: string;
}

export function UserAuditLogs({ userId }: UserAuditLogsProps) {
  // ✅ اصلاح ۱: فراخوانی صحیح هوک با آبجکت
  const { data, isLoading } = useGetUserAuditLogs(userId, {
    page: 1,
    page_size: 50,
  });

  // دسترسی به آرایه اصلی آیتم‌ها
  const logs = data?.items || [];

  const getActionConfig = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("credit") || act.includes("wallet")) {
      return { icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" };
    }
    if (act.includes("role")) {
      return {
        icon: ShieldAlert,
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    }
    if (act.includes("status") || act.includes("ban")) {
      return { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" };
    }
    return { icon: UserCog, color: "text-blue-600", bg: "bg-blue-50" };
  };

  if (isLoading) {
    return <AuditLogsSkeleton />;
  }

  // ✅ اصلاح ۲: استفاده از Empty State گرافیکی و زیبا به جای متن ساده
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <History className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-900 font-medium text-sm">
          تاریخچه‌ای یافت نشد
        </p>
        <p className="text-slate-500 text-xs mt-1">
          هنوز هیچ فعالیتی ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none ring-1 ring-gray-200">
      <CardHeader className="pb-4 border-b border-gray-50 mb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
          <History className="w-4 h-4 text-gray-500" />
          تاریخچه عملیات (Audit Logs)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6 relative">
            {/* Timeline Line (RTL handled correctly) */}
            <div className="absolute top-2 bottom-2 right-[15px] w-px bg-gray-200" />

            {logs.map((log) => {
              const config = getActionConfig(log.action);
              return (
                <div key={log.id} className="relative flex gap-4 mr-2 group">
                  {/* Timeline Dot */}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white shadow-sm transition-transform group-hover:scale-110 ${config.bg}`}
                  >
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono dir-ltr">
                        {new Date(log.created_at).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {log.reason_note && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 mt-1">
                        <span className="font-semibold text-gray-500 ml-1">
                          دلیل:
                        </span>
                        {log.reason_note}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 font-mono text-gray-400 bg-white border-gray-200"
                      >
                        Admin: {log.admin_id.slice(0, 8)}...
                      </Badge>
                      {log.ip_address && (
                        <span className="text-[10px] text-gray-300 font-mono">
                          IP: {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AuditLogsSkeleton() {
  return (
    <div className="space-y-6 px-2 py-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
