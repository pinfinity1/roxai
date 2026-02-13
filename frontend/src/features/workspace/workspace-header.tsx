"use client";

import { Sparkles, Zap } from "lucide-react";
import { useGetMyCredit } from "@/lib/api/auth/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar"; // ✅ تریگر استاندارد
import { UserNav } from "./user-nav";
import { SearchInput } from "./search-input";

export function WorkspaceHeader() {
  const { data: credit, isLoading } = useGetMyCredit();

  // لاجیک موقت پلن
  const planName = (credit || 0) > 1000 ? "Pro Plan" : "Free Plan";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end md:justify-between gap-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 md:px-6 supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:flex items-center gap-2 font-bold text-lg tracking-tight text-foreground/80 mr-2">
        میز کار
      </div>

      {/* Right: Credits, Plan, User */}
      <div className="flex items-center gap-3">
        {/* Subscription Capsule - Hidden on very small screens */}
        <div className="hidden sm:flex items-center p-1 pl-3 pr-1 bg-secondary/40 border border-border/50 rounded-full backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mr-3">
            <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              {planName}
            </span>
          </div>

          <div className="h-4 w-px bg-border/60 mx-1" />

          <div className="flex items-center gap-1.5 mr-2">
            {isLoading ? (
              <Skeleton className="h-4 w-10" />
            ) : (
              <span className="font-mono text-sm font-bold text-foreground">
                {credit?.toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Coins
            </span>
          </div>

          <Button
            variant="default"
            size="icon"
            className="h-7 w-7 rounded-full ml-1 shadow-sm hover:shadow-md transition-all bg-foreground text-background hover:bg-foreground/90"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
        </div>

        <UserNav />
      </div>
    </header>
  );
}
