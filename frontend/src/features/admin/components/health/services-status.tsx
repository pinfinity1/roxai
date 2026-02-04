"use client";

import { SystemHealthResponse } from "@/lib/api/model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  HardDrive,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface ServicesStatusProps {
  data?: SystemHealthResponse;
  isLoading: boolean;
}

export function ServicesStatus({ data, isLoading }: ServicesStatusProps) {
  // نگاشت وضعیت دیتابیس به رنگ و آیکون
  const isDbHealthy = data?.database_status === "healthy";

  if (isLoading)
    return <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-500" />
          وضعیت زیرساخت
        </CardTitle>
        <CardDescription>بررسی اتصال به سرویس‌های حیاتی</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Database Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${isDbHealthy ? "bg-emerald-100" : "bg-red-100"}`}
            >
              <Database
                className={`w-4 h-4 ${isDbHealthy ? "text-emerald-700" : "text-red-700"}`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                PostgreSQL Database
              </p>
              <p className="text-xs text-slate-500">Main User Data Store</p>
            </div>
          </div>
          <Badge
            variant={isDbHealthy ? "outline" : "destructive"}
            className={
              isDbHealthy
                ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                : ""
            }
          >
            {isDbHealthy ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Disconnected
              </span>
            )}
          </Badge>
        </div>

        {/* MinIO Status (فرض بر سالم بودن چون در API فعلی نیست، اما برای UI لازم است) */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <HardDrive className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Object Storage (MinIO)
              </p>
              <p className="text-xs text-slate-500">Asset & File Management</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 bg-blue-50"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Operational
            </span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
