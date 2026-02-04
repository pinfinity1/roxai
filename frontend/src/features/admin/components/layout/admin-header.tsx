"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // برای اینکه وقتی موس روی خروج رفت بنویسد "خروج"
import { AdminBreadcrumb } from "./admin-breadcrumb";

export function AdminHeader() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 hidden md:flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
      {/* سمت راست: مسیر یاب */}
      <div className="flex items-center gap-4">
        <AdminBreadcrumb />
      </div>

      {/* سمت چپ: ابزارها و پروفایل */}
      <div className="flex items-center gap-3">
        {/* جستجو و نوتیفیکیشن (فعلا غیرفعال) */}
        <div className="relative hidden lg:block w-64 ml-2 opacity-50">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            disabled
            placeholder="جستجو..."
            className="h-9 pr-9 bg-gray-50 text-xs"
          />
        </div>

        <Button variant="ghost" size="icon-sm" className="text-gray-500">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="h-6 w-[1px] bg-gray-200 mx-1" />

        {/* پروفایل و خروج */}
        {status === "loading" ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-1">
            {/* 1. اطلاعات کاربر (فقط نمایش) */}
            <div className="flex flex-col items-end select-none">
              <span className="text-sm font-bold text-gray-900 leading-none">
                {user?.name || "کاربر"}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                {user?.role || "ADMIN"}
              </span>
            </div>

            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>

            {/* 2. دکمه خروج مستقیم (جایگزین منوی اضافی) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mr-1 h-8 w-8 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-vazir text-xs">
                  <p>خروج از حساب</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </header>
  );
}
