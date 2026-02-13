import React from "react";
import { AdminSidebar } from "@/features/admin/components/layout/admin-sidebar";
import { AdminHeader } from "@/features/admin/components/layout/admin-header";
import { AdminMobileNav } from "@/features/admin/components/layout/admin-mobile-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    // 1. Root Container: تنظیم جهت راست‌چین و فونت وزیر
    <div className="flex min-h-screen w-full bg-[#F9FAFB] font-vazir" dir="rtl">
      {/* 2. Desktop Sidebar (ثابت در سمت راست) 
          - در موبایل (md:hidden) مخفی است.
          - عرض w-64 دارد.
          - z-index: 40 برای اینکه زیر مودال‌ها باشد اما روی محتوا.
      */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 right-0 z-40 border-l border-gray-200 bg-white">
        <AdminSidebar className="h-full w-full" />
      </div>

      {/* 3. Main Content Wrapper 
          - در دسکتاپ حاشیه راست (mr-64) می‌گیرد تا زیر سایدبار نرود.
      */}
      <div className="flex flex-col flex-1 md:mr-64 transition-all duration-300 min-h-screen">
        {/* الف) Mobile Header 
            فقط در موبایل دیده می‌شود و دکمه منو دارد.
        */}
        <AdminMobileNav />

        {/* ب) Desktop Header 
            فقط در دسکتاپ دیده می‌شود و Breadcrumb دارد.
        */}
        <AdminHeader />

        {/* ج) Page Content (محتوای اصلی صفحات) */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* انیمیشن ملایم برای ورود محتوا */}
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
