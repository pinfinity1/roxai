"use client";

import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchDialog } from "@/components/global/global-search";
import { CreditsDialog } from "@/components/global/credits-dialog";
import { NotificationsDropdown } from "./notifications-dropdown";

interface HomeHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function HomeHeader({ title, icon }: HomeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* Right Actions (بدون تغییر) */}
      <div className="hidden lg:flex items-center gap-1 sm:gap-2 w-full md:w-auto justify-end">
        <GlobalSearchDialog>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Search className="size-5" />
          </Button>
        </GlobalSearchDialog>

        <CreditsDialog balance={400}>
          <div className="hidden md:flex items-center px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-semibold gap-2 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors mx-2">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>۴۰۰ سکه</span>
          </div>
        </CreditsDialog>

        <NotificationsDropdown />
      </div>
    </div>
  );
}
