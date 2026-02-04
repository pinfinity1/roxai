"use client";

import { useAdminListProjects } from "@/lib/api/admin-console/admin-console";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, FolderOpen, SearchX } from "lucide-react";

interface UserProjectsTabProps {
  userId: string;
}

export function UserProjectsTab({ userId }: UserProjectsTabProps) {
  const { data, isLoading } = useAdminListProjects({
    page: 1,
    page_size: 10,
    user_id: userId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        <p className="text-sm text-slate-400">در حال دریافت لیست پروژه‌ها...</p>
      </div>
    );
  }

  // ✅ Empty State جدید و زیبا
  if (!data?.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <FolderOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-medium text-base">
          پروژه‌ای یافت نشد
        </h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs text-center leading-relaxed">
          این کاربر هنوز هیچ پروژه‌ای ایجاد نکرده است.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {data.items.map((project) => (
        <Card
          key={project.id}
          className="group hover:border-slate-400 transition-colors cursor-default border-slate-200 shadow-sm"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {project.title}
                </h4>
                <p
                  className="text-xs text-slate-500 font-mono mt-0.5"
                  dir="ltr"
                >
                  {new Date(project.created_at).toLocaleDateString("fa-IR")}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                project.status === "done"
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : project.status === "failed"
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "bg-slate-100 text-slate-600"
              }
            >
              {project.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
