"use client";

import { AdminUserListItem } from "@/lib/api/model";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Mail,
  Phone,
  Calendar,
  Shield,
  Wallet,
  Ghost,
  Ban,
  CheckCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";

// Dialogs
import { ImpersonateDialog } from "../dialogs/impersonate-dialog";
import { UserStatusDialog } from "../dialogs/user-status-dialog";
import { CreditAdjustDialog } from "../dialogs/credit-adjust-dialog";

interface UserProfileSidebarProps {
  user: AdminUserListItem;
  onRefresh: () => void;
}

export function UserProfileSidebar({
  user,
  onRefresh,
}: UserProfileSidebarProps) {
  const copyToClipboard = (text: any, label: string = "") => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success(`${label} کپی شد`);
  };

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      {/* 1. Minimal Header (No Gradient) */}
      <div className="flex flex-col items-center pt-8 pb-6 bg-slate-50/50">
        <Avatar className="h-24 w-24 border-4 border-white shadow-sm mb-4">
          {/* استفاده از any برای رفع ارور موقت */}
          <AvatarImage src={(user as any).avatar_url || ""} />
          <AvatarFallback className="text-3xl font-light bg-slate-200 text-slate-600">
            {(user.first_name?.[0] || user.email?.[0] || "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-xl font-bold text-gray-900 text-center px-4">
          {user.first_name
            ? `${user.first_name} ${user.last_name || ""}`
            : "کاربر بدون نام"}
        </h2>

        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
          <span className="font-mono" dir="ltr">
            @{user.id.slice(0, 8)}...
          </span>
          <Copy
            className="w-3 h-3 cursor-pointer hover:text-black transition-colors"
            onClick={() => copyToClipboard(user.id, "شناسه کاربر")}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Badge
            variant={user.is_active ? "outline" : "destructive"}
            className={
              user.is_active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : ""
            }
          >
            {user.is_active ? "Active" : "Banned"}
          </Badge>
          <Badge
            variant="secondary"
            className="uppercase text-[10px] tracking-wider font-bold"
          >
            {user.role}
          </Badge>
        </div>
      </div>

      <Separator />

      <CardContent className="space-y-5 pt-6">
        {/* Contact Info - Clean List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>ایمیل</span>
            </div>
            <div className="flex items-center gap-2 max-w-[60%]">
              <span
                className="font-medium text-gray-900 truncate"
                dir="ltr"
                title={user.email || ""}
              >
                {user.email ? String(user.email) : "---"}
              </span>
              {user.email && (
                <Copy
                  className="w-3 h-3 text-muted-foreground hover:text-black cursor-pointer"
                  onClick={() => copyToClipboard(user.email, "ایمیل")}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>موبایل</span>
            </div>
            <span className="font-mono text-gray-900" dir="ltr">
              {user.mobile || "---"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>عضویت</span>
            </div>
            <span className="text-gray-900" dir="ltr">
              {new Date(user.created_at).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>

        {/* Credit Box - Minimal */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">کیف پول</span>
          </div>
          <span className="font-mono font-bold text-lg text-slate-900">
            {user.credit?.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">تومان</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
        <ImpersonateDialog
          userId={user.id}
          trigger={
            <Button
              variant="default"
              className="w-full bg-black hover:bg-gray-800 text-white shadow-none"
            >
              <Ghost className="w-4 h-4 ml-2" />
              ورود به پنل کاربر
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3 w-full">
          <CreditAdjustDialog
            userId={user.id}
            onSuccess={onRefresh}
            trigger={
              <Button
                variant="outline"
                className="w-full border-dashed border-gray-300 hover:border-gray-400"
              >
                مدیریت مالی
              </Button>
            }
          />
          <UserStatusDialog
            userId={user.id}
            isActive={user.is_active}
            onSuccess={onRefresh}
            trigger={
              <Button
                variant="outline"
                className={
                  user.is_active
                    ? "text-red-600 hover:bg-red-50 border-red-100"
                    : "text-emerald-600 hover:bg-emerald-50 border-emerald-100"
                }
              >
                {user.is_active ? "مسدود سازی" : "فعال‌سازی"}
              </Button>
            }
          />
        </div>
      </CardFooter>
    </Card>
  );
}
