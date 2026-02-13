// frontend/src/components/global/mobile-header.tsx
"use client";

import { Bell, Search, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlobalSearchDialog } from "@/components/global/global-search";
import { CreditsDialog } from "@/components/global/credits-dialog";
import { NotificationsDropdown } from "@/features/home/components/notifications-dropdown"; // یا مسیری که نوتیفیکیشن هست

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md lg:hidden">
      {/* سمت راست: منو و مشخصات فضای کار */}
      <div className="flex items-center gap-3">
        {/* دکمه همبرگری (باز کردن سایدبار) */}
        <SidebarTrigger className="-mr-2 text-muted-foreground hover:text-foreground" />

        {/* جداکننده کوچک */}
        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* مشخصات ورک‌اسپیس (شبیه Gamma) */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 rounded-md border border-border/50">
            <AvatarImage src="" />
            <AvatarFallback className="rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">
              EW
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px]">
            فضای کار احسان
          </span>
        </div>
      </div>

      {/* سمت چپ: ابزارها (سرچ، زنگوله، کردیت) */}
      <div className="flex items-center gap-1">
        {/* جستجو */}
        <GlobalSearchDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Search className="size-5" />
          </Button>
        </GlobalSearchDialog>

        {/* اعلان‌ها (دراپ‌داون) */}
        <div className="relative">
          <NotificationsDropdown />
        </div>

        {/* کردیت (Sparkles) */}
        <CreditsDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            <Sparkles className="size-5 fill-amber-500/20" />
          </Button>
        </CreditsDialog>
      </div>
    </header>
  );
}
