"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  return (
    <div className="relative w-full max-w-md hidden md:block">
      <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="جستجو در پروژه‌ها..."
        className="w-full bg-background/50 pr-9 pl-4 h-9 text-sm transition-all focus:bg-background focus:w-full md:w-[200px] lg:w-[300px] md:focus:w-[400px]"
      />
    </div>
  );
}
