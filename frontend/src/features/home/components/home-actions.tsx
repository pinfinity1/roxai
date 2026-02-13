// frontend/src/features/home/components/home-actions.tsx
"use client";

import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateRokhDialog } from "@/features/rokhs/rokh-actions/create-rokh-dialog";

export function HomeActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CreateRokhDialog>
        <Button
          size="lg"
          className="h-12 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-base gap-3"
        >
          <Sparkles className="size-5 animate-pulse" />
          ساخت رخ
          <span className="bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            New
          </span>
        </Button>
      </CreateRokhDialog>

      {/* Create Empty */}
      <Button
        variant="outline"
        size="lg"
        className="h-12 px-5 rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all gap-2"
      >
        <Plus className="size-5" />
        پروژه خالی
      </Button>

      {/* Import */}
      <Button
        variant="ghost"
        size="lg"
        className="h-12 px-5 rounded-xl text-muted-foreground hover:text-foreground gap-2"
      >
        وارد کردن
      </Button>
    </div>
  );
}
