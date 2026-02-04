"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AdminSidebar } from "./admin-sidebar";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // UX Rule: وقتی کاربر روی یک لینک کلیک کرد و صفحه عوض شد، منو باید خودکار بسته شود
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
      {/* 1. Logo (Mobile View) */}
      <div className="flex items-center gap-2">
        <BrandLogo size="sm" />
      </div>

      {/* 2. Toggle Button & Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-2 text-gray-500">
            <Menu className="h-6 w-6" />
            <span className="sr-only">باز کردن منو</span>
          </Button>
        </SheetTrigger>

        {/* RTL Note: side="right" یعنی منو از سمت راست باز می‌شود 
            که استاندارد پنل‌های فارسی است.
        */}
        <SheetContent side="right" className="p-0 w-72 border-none">
          {/* Accessibility Requirement: تایتل برای اسکرین ریدرها الزامی است */}
          <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>

          {/* ✅ Reusability: استفاده مجدد از همان سایدبار اصلی */}
          <AdminSidebar className="border-none h-full" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
