"use client";

import { AdminUserListItem } from "@/lib/api/model";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, ShieldAlert, CheckCircle2 } from "lucide-react";
import { UserTableActions } from "./user-table-actions";
import { cn } from "@/lib/utils";

interface UserMobileListProps {
  data: AdminUserListItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function UserMobileList({
  data,
  isLoading,
  onRefresh,
}: UserMobileListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground animate-pulse">
        در حال بارگذاری...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
        <p>هیچ کاربری با این مشخصات یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden pb-20">
      {data.map((user) => (
        <Card
          key={user.id}
          className={cn(
            "shadow-sm transition-all active:scale-[0.99]",
            !user.is_active && "bg-red-50/50 border-red-200",
          )}
        >
          <CardContent className="p-4 flex items-start justify-between">
            {/* Left Side: User Info */}
            <div className="flex gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback
                  className={cn(
                    user.role === "admin" && "bg-indigo-100 text-indigo-700",
                  )}
                >
                  {user.first_name?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900 line-clamp-1">
                    {user.first_name
                      ? `${user.first_name} ${user.last_name}`
                      : "کاربر ناشناس"}
                  </span>

                  {/* Status Badge */}
                  {user.is_active ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1 h-5"
                    >
                      مسدود
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                  {user.email || user.mobile}
                </p>

                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1">
                  <Wallet className="w-3 h-3" />
                  <span>{user.credit?.toLocaleString() ?? 0}</span>
                  <span className="text-[9px] opacity-70">تومان</span>
                </div>
              </div>
            </div>

            {/* Right Side: Actions & Role */}
            <div className="flex flex-col items-end justify-between h-full gap-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider bg-background"
              >
                {user.role}
              </Badge>

              <div className="mt-2">
                <UserTableActions user={user} onRefresh={onRefresh} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
