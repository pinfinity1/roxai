"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useListUsers } from "@/lib/api/admin-console/admin-console";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  LayoutDashboard,
  History,
  FolderOpen,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Components
import { UserProfileSidebar } from "@/features/admin/components/users/profile/user-profile-sidebar";
import { UserOverviewTab } from "@/features/admin/components/users/profile/user-overview-tab";
import { UserAuditLogs } from "@/features/admin/components/users/profile/user-audit-logs";
import { UserProjectsTab } from "@/features/admin/components/users/profile/user-projects-tab";

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const { data, isLoading, refetch } = useListUsers({
    page: 1,
    page_size: 1,
    query: userId,
  });

  const user = data?.items?.[0];

  if (isLoading) return <UserDetailsSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-lg font-bold text-gray-500">کاربر یافت نشد</p>
        <Button variant="outline" onClick={() => router.back()}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 md:pb-0">
      {/* 1. Top Navigation */}
      <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">جزئیات کاربر</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <UserProfileSidebar user={user} onRefresh={refetch} />
        </div>

        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-8 space-y-6 overflow-hidden">
          {" "}
          {/* overflow-hidden added to prevent page scroll from tabs */}
          <Tabs defaultValue="overview" className="w-full">
            {/* ✅ اصلاح شده برای موبایل: اسکرول افقی */}
            <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
              <TabsList className="inline-flex w-max min-w-full justify-start border-b rounded-none h-14 bg-transparent p-0 gap-6 md:gap-8">
                <TabsTrigger
                  value="overview"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black py-4 px-4 font-medium text-gray-500 hover:text-gray-800 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 ml-2" />
                  نمای کلی
                </TabsTrigger>

                <TabsTrigger
                  value="projects"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black py-4 px-4 font-medium text-gray-500 hover:text-gray-800 transition-all"
                >
                  <FolderOpen className="w-4 h-4 ml-2" />
                  پروژه‌ها
                </TabsTrigger>

                <TabsTrigger
                  value="billing"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black py-4 px-4 font-medium text-gray-500 hover:text-gray-800 transition-all"
                >
                  <Wallet className="w-4 h-4 ml-2" />
                  تراکنش‌ها
                </TabsTrigger>

                <TabsTrigger
                  value="history"
                  className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black py-4 px-4 font-medium text-gray-500 hover:text-gray-800 transition-all"
                >
                  <History className="w-4 h-4 ml-2" />
                  لاگ فعالیت‌ها
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="overview" className="animate-in fade-in-50">
                <UserOverviewTab user={user} onRefresh={refetch} />
              </TabsContent>

              <TabsContent value="projects" className="animate-in fade-in-50">
                <UserProjectsTab userId={user.id} />
              </TabsContent>

              <TabsContent value="billing" className="animate-in fade-in-50">
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Wallet className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-medium text-base">
                    تراکنشی یافت نشد
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs text-center leading-relaxed">
                    کیف پول این کاربر تا کنون تراکنش ورودی یا خروجی نداشته است.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="animate-in fade-in-50">
                <UserAuditLogs userId={userId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="lg:col-span-8 h-[600px] rounded-xl" />
      </div>
    </div>
  );
}
