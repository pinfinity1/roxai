"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Separator } from "@/components/ui/separator";
import { adminBottomItems, adminSidebarItems } from "./admin-navigation";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-l border-gray-200", // border-l برای جدا کردن سایدبار از محتوا (در حالت RTL سایدبار راست است)
        className,
      )}
    >
      {/* 1. Header & Logo */}
      <div className="flex items-center pt-4 px-6 border-b border-gray-100 shrink-0">
        <Link href="/admin">
          <BrandLogo size="sm" />
        </Link>
      </div>

      {/* 2. Main Navigation (Scrollable) */}
      <ScrollArea className="flex-1 py-6 px-4">
        <div dir="rtl" className="flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400 px-4 mb-2">
            منوی اصلی
          </span>
          {adminSidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(item.disabled && "pointer-events-none")}
              >
                <Button
                  variant="ghost"
                  disabled={item.disabled}
                  className={cn(
                    "w-full justify-start gap-3 h-10 font-medium transition-all duration-200 mb-1 cursor-pointer",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100 hover:bg-blue-100 hover:text-blue-800"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    item.disabled && "opacity-50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700",
                    )}
                  />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* 3. Footer Section (User Info & Logout) */}
      <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/50">
        {/* Bottom Actions */}
        <div className="flex flex-col gap-1 mb-4">
          {adminBottomItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              disabled={item.disabled}
              className="w-full justify-start gap-3 text-gray-500 h-8"
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Button>
          ))}
        </div>

        <Separator className="mb-4 bg-gray-200" />

        {/* Admin Profile Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 ring-2 ring-white">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-gray-900 truncate">
                پنل عملیات ویژه
              </span>
              <span className="text-[10px] text-gray-500 font-mono truncate">
                دسترسی ایمن فعال
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 text-xs border-dashed border-gray-300"
          >
            <LogOut className="w-3 h-3" />
            خروج از حساب
          </Button>
        </div>
      </div>
    </aside>
  );
}
