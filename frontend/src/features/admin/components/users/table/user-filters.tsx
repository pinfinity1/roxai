"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  RotateCcw,
  Shield,
  Activity,
  Filter,
  Check,
} from "lucide-react";
import { UserRole } from "@/lib/api/model";
import { cn } from "@/lib/utils";

interface UserFiltersProps {
  currentRole?: UserRole | "all";
  currentStatus?: "active" | "banned" | "all";
  onRoleChange: (role: UserRole | "all") => void;
  onStatusChange: (status: "active" | "banned" | "all") => void;
  onReset: () => void;
}

export function UserFilters({
  currentRole = "all",
  currentStatus = "all",
  onRoleChange,
  onStatusChange,
  onReset,
}: UserFiltersProps) {
  // محاسبه تعداد فیلترهای فعال برای نمایش در بج (Badge) روی دکمه
  const activeFiltersCount =
    (currentRole !== "all" ? 1 : 0) + (currentStatus !== "all" ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">فیلترها</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 min-w-[1.25rem] mr-auto"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[300px] sm:w-[380px] flex flex-col h-full border-r-0"
      >
        {/* --- Header --- */}
        <SheetHeader className="text-right pb-4 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Filter className="w-5 h-5" />
            <SheetTitle className="text-lg">فیلترهای پیشرفته</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            نتایج جستجو را دقیق‌تر کنید.
          </SheetDescription>
        </SheetHeader>

        {/* --- Body (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto py-6 space-y-7 px-2">
          {/* 1. Role Filter Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>سطح دسترسی (Role)</span>
            </div>

            <Select
              value={currentRole}
              onValueChange={(val) => onRoleChange(val as UserRole | "all")}
            >
              <SelectTrigger className="w-full text-right h-10" dir="rtl">
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">همه کاربران</SelectItem>
                <SelectItem value="admin">مدیر کل (Admin)</SelectItem>
                <SelectItem value="support">پشتیبان (Support)</SelectItem>
                <SelectItem value="pro">حرفه‌ای (Pro)</SelectItem>
                <SelectItem value="free">رایگان (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="opacity-50" />

          {/* 2. Status Filter Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>وضعیت حساب (Status)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Custom Radio-like Buttons for better UX than Select */}
              <div
                onClick={() => onStatusChange("active")}
                className={cn(
                  "cursor-pointer rounded-md border p-3 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all",
                  currentStatus === "active" &&
                    "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500",
                )}
              >
                <Check className="w-4 h-4" />
                <span className="text-xs font-bold">فعال</span>
              </div>

              <div
                onClick={() => onStatusChange("banned")}
                className={cn(
                  "cursor-pointer rounded-md border p-3 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all",
                  currentStatus === "banned" &&
                    "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500",
                )}
              >
                <Shield className="w-4 h-4 rotate-180" />
                <span className="text-xs font-bold">مسدود شده</span>
              </div>
            </div>

            {/* دکمه بازگشت به حالت "همه" اگر چیزی انتخاب شده باشد */}
            {currentStatus !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange("all")}
                className="w-full h-7 text-xs text-muted-foreground"
              >
                نمایش همه وضعیت‌ها
              </Button>
            )}
          </div>
        </div>

        {/* --- Footer (Sticky Bottom) --- */}
        <SheetFooter className="border-t pt-4 sm:justify-start gap-3 mt-auto">
          <SheetClose asChild>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              مشاهده نتایج
            </Button>
          </SheetClose>

          <Button
            variant="outline"
            onClick={onReset}
            className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            پاک کردن همه
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
