"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserListItem } from "@/lib/api/model";

interface UserProfileHeaderProps {
  user: AdminUserListItem;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <Card className="border-l-4 border-l-blue-600 shadow-sm mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* User Identity */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-1 ring-gray-100">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {(user.first_name?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.first_name || "کاربر"} {user.last_name || "ناشناس"}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-mono dir-ltr">
                  {user.email || user.mobile}
                </p>
                <Badge
                  variant={user.is_active ? "secondary" : "destructive"}
                  className="text-[10px]"
                >
                  {user.is_active ? "فعال" : "مسدود"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">
                اعتبار کیف پول
              </p>
              <p className="font-mono font-bold text-emerald-600 dir-ltr">
                {user.credit?.toLocaleString()}{" "}
                <span className="text-[10px]">T</span>
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">نقش کاربری</p>
              <Badge
                variant="outline"
                className="uppercase font-bold tracking-wider"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
