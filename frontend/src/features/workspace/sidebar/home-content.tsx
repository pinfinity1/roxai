"use client";

import Link from "next/link";
import { workspaceNavigation } from "./workspace-navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  UserPlus,
  CreditCard,
  Sparkles,
  FolderPlus,
  Check,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarModalWrapper } from "./sidebar-modal-wrapper";
import { SidebarDropdownWrapper } from "./sidebar-dropdown-wrapper";

export function HomeContextContent() {
  const pathname = usePathname();
  const navItems =
    workspaceNavigation.mainNav.find((n) => n.title === "خانه")?.items || [];

  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header: Workspace Selector */}
      <div className="p-3">
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 h-14 hover:bg-muted/60 border border-transparent hover:border-border/40 transition-all rounded-xl"
            >
              <div className="flex items-center gap-3 overflow-hidden text-right">
                <Avatar className="h-9 w-9 rounded-lg border bg-gradient-to-tr from-blue-100 to-indigo-100">
                  <AvatarFallback className="rounded-lg text-indigo-600 font-bold">
                    EW
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-semibold text-sm truncate w-28">
                    فضای کار احسان
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="bg-emerald-500/10 text-emerald-600 px-1 rounded-[3px]">
                      Free
                    </span>
                    <span>·</span>
                    <span>۱ عضو</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              تغییر فضای کار
            </DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 rounded border">
                  <AvatarFallback className="text-[10px]">EW</AvatarFallback>
                </Avatar>
                <span className="text-sm">فضای کار احسان</span>
              </div>
              <Check className="mr-auto size-3" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserPlus className="ml-2 size-4" />
              ساخت فضای کار جدید
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        {/* Actions & Upgrade */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-2 text-xs h-8"
            >
              <UserPlus className="size-3.5" />
              دعوت
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center gap-2 text-xs h-8"
            >
              <CreditCard className="size-3.5" />
              اشتراک
            </Button>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-background p-2 transition-all duration-300 hover:shadow-sm dark:from-indigo-950/20 dark:to-purple-950/10 hover:border-indigo-500 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-indigo-500 p-1 text-white shadow-sm">
                <Sparkles className="size-3" />
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ارتقا به حرفه‌ای
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const ButtonContent = (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2.5 h-9 px-2.5 font-normal text-muted-foreground hover:text-foreground transition-all",
                  // اگر دراپ‌داون باز باشه می‌تونیم استایل بدیم ولی فعلا ساده نگه می‌داریم
                )}
              >
                <item.icon className="size-4" />
                <span className="text-xs">{item.title}</span>
                {/* اگر دراپ‌داون بود، یک فلش کوچیک هم نشون بدیم بد نیست */}
                {item.variant === "dropdown" && (
                  <ChevronDown className="mr-auto size-3 opacity-50" />
                )}
              </Button>
            );

            if (item.variant === "dropdown") {
              return (
                <SidebarDropdownWrapper key={item.title} item={item}>
                  {ButtonContent}
                </SidebarDropdownWrapper>
              );
            }

            if (item.variant === "modal") {
              return (
                <SidebarModalWrapper key={item.title} actionId={item.actionId}>
                  {ButtonContent}
                </SidebarModalWrapper>
              );
            }

            // حالت ۲: لینک‌های معمولی
            const href = item.url ?? "#";
            let isActive = false;

            if (item.url) {
              // اگر لینک اصلی خانه (/) است:
              // فقط وقتی فعال شود که دقیقاً در روت باشیم و هیچ کوئری پارامتری (مثل ?filter) نداشته باشیم
              if (item.url === "/") {
                isActive = pathname === "/" && searchParams.toString() === "";
              }
              // اگر لینک دارای کوئری است (مثل /?filter=shared):
              // چک می‌کنیم که پات‌نیم یکی باشد و کوئری استرینگ هم مچ باشد
              else if (item.url.includes("?")) {
                const [path, query] = item.url.split("?");
                isActive =
                  pathname === path && searchParams.toString() === query;
              }
              // سایر لینک‌ها (مثل /folders):
              // چک می‌کنیم که با آن شروع شده باشد
              else {
                isActive = pathname.startsWith(item.url);
              }
            }

            return (
              <Link key={item.title} href={href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2.5 h-9 px-2.5 font-normal text-muted-foreground hover:text-foreground transition-all cursor-pointer",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm",
                  )}
                >
                  <item.icon className={cn("size-4", isActive && "stroke-2")} />
                  <span className="text-xs">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Folders */}
        <div className="pt-4 mt-2 border-t border-border/40">
          <div className="flex items-center justify-between px-2 mb-1 group">
            <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              پوشه‌های من
            </span>
            {/* دکمه ساخت پوشه جدید */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <FolderPlus className="size-3.5 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>

          {/* اینجا بعداً لیست پوشه‌ها را مپ می‌کنیم */}
          {/* فعلاً حالت خالی: */}
          <div className="px-2 py-4 flex flex-col items-center justify-center border border-dashed border-muted/60 rounded-lg bg-muted/5 mx-2">
            <span className="text-[10px] text-muted-foreground italic">
              پوشه‌ای ندارید
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
