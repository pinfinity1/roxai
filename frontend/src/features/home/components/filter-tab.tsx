"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FilterTabProps {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function FilterTab({ value, label, icon, className }: FilterTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        // Base Layout
        "flex items-center gap-2 rounded-none bg-transparent px-4 pb-3 pt-2 transition-all",
        // Borders
        "border-b-2 border-transparent",
        // Typography & Colors
        "font-medium text-muted-foreground hover:text-foreground",
        // Active State
        "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </TabsTrigger>
  );
}
