// frontend/src/components/global/notifications-dropdown.tsx
"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsDropdown() {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground relative cursor-pointer"
        >
          <Bell className="size-5" />
          {/* Notification Dot */}
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>اعلان‌ها</span>
          <span className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-primary">
            خواندن همه
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <NotificationItem
            title="پروژه شما آماده شد"
            desc="اسلاید 'معرفی استارتاپ' با موفقیت ساخته شد."
            time="۲ دقیقه پیش"
            unread
          />
          <NotificationItem
            title="به‌روزرسانی سیستم"
            desc="نسخه جدید Roxai با قابلیت‌های هوش مصنوعی پیشرفته منتشر شد."
            time="۱ ساعت پیش"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({
  title,
  desc,
  time,
  unread,
}: {
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-muted/50">
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-sm font-medium ${unread ? "text-foreground" : "text-muted-foreground"}`}
        >
          {title}
        </span>
        {unread && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
      <span className="text-[10px] text-muted-foreground/50 pt-1">{time}</span>
    </DropdownMenuItem>
  );
}
