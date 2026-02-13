"use client";

import {
  CreditCard,
  LogOut,
  Settings,
  User,
  Sparkles,
  Bell,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function UserNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  // فرض: دریافت پلن کاربر (بعداً از API)
  const userPlan = "Free";

  return (
    <DropdownMenu dir="rtl">
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Status Dot */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        {/* Header: User Info & Plan */}
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border/50">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-bold truncate text-foreground">
                {user?.name || "کاربر Roxai"}
              </p>
            </div>
            {/* Plan Badge */}
            <div className="flex items-center justify-between bg-secondary/30 p-1.5 rounded-md border border-border/40">
              <span className="text-xs font-medium text-muted-foreground px-1">
                پلن فعلی:
              </span>
              <Badge
                variant="outline"
                className="h-5 bg-background text-[10px] px-2 shadow-none border-primary/20 text-primary"
              >
                {userPlan} Plan
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          {/* Upgrade Item (Highlight) */}
          <DropdownMenuItem
            asChild
            className="cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-950/30"
          >
            <Link
              href="/dashboard/billing"
              className="flex items-center w-full"
            >
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 w-full">
                <Sparkles className="ml-2 size-4" />
                <span className="font-semibold flex-1">ارتقای حساب</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                >
                  PRO
                </Badge>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/profile">
              <User className="ml-2 size-4 text-muted-foreground" />
              <span>پروفایل کاربری</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/billing">
              <CreditCard className="ml-2 size-4 text-muted-foreground" />
              <span>مدیریت پرداخت‌ها</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/settings">
              <Settings className="ml-2 size-4 text-muted-foreground" />
              <span>تنظیمات</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/notifications">
              <Bell className="ml-2 size-4 text-muted-foreground" />
              <span>اعلان‌ها</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2"
        >
          <LogOut className="ml-2 size-4" />
          <span className="font-medium">خروج از حساب</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
