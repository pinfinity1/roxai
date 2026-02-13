// frontend/src/features/workspace/sidebar/sidebar-footer.tsx
"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { workspaceNavigation } from "./workspace-navigation";
import { SidebarModalWrapper } from "./sidebar-modal-wrapper";
import { cn } from "@/lib/utils";

export function SidebarFooterCommon() {
  const footerItems = workspaceNavigation.sidebarFooter;
  const accountItem = footerItems.find((i) => i.url === "/account");
  const actionItems = footerItems.filter((i) => i.url !== "/account");

  return (
    <SidebarFooter className="flex flex-col gap-2 p-2">
      {actionItems.length > 0 && (
        <div className="flex items-center justify-center gap-1 md:flex-col md:gap-2">
          {actionItems.map((item) => (
            <SidebarModalWrapper key={item.title} actionId={item.actionId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="h-10 w-10 flex items-center !justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground md:w-full md:justify-start md:px-3 transition-all cursor-pointer">
                    <item.icon className="size-5 shrink-0" />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </SidebarModalWrapper>
          ))}
        </div>
      )}

      {/* 2. منوی کاربری (ترکیب دیزاین زیبا + دیتای داینامیک) */}
      {accountItem && (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="flex items-center !justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-12 md:px-2 transition-all group cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-border/50">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  EB
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="left" // چون سایدبار راست است، باید چپ باز شود
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 ml-2" // کلاس‌های شما
            sideOffset={10}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              حساب کاربری
            </DropdownMenuLabel>

            <div className="px-2 py-1.5 flex items-center gap-3">
              <Avatar className="size-8 border">
                <AvatarFallback>EB</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">احسان بهرامی</span>
                <span className="text-xs text-muted-foreground">
                  bahrami@example.com
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer">
              <Sparkles className="ml-2 size-4 text-amber-500" />
              <span className="flex-1">اعتبار باقی‌مانده</span>
              <span className="text-xs font-mono bg-amber-100 text-amber-700 px-1 rounded">
                400
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* دکمه خروج را داخل رپر گذاشتم تا فانکشنالیتی کار کند، ولی ظاهر همان است */}
            <SidebarModalWrapper actionId="logout">
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="ml-2 size-4" /> خروج
              </DropdownMenuItem>
            </SidebarModalWrapper>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarFooter>
  );
}
