// frontend/src/components/global/global-search.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GlobalSearchProps {
  children?: React.ReactNode; // دکمه‌ای که دیالوگ را باز می‌کند
}

export function GlobalSearchDialog({ children }: GlobalSearchProps) {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer" asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Search className="size-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] top-[20%] translate-y-[-20%]">
        <DialogHeader>
          <DialogTitle className="text-right">جستجو در رخ‌ها</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border rounded-xl px-3 bg-muted/30 mt-2">
          <Search className="size-4 text-muted-foreground ml-2" />
          <Input
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            placeholder="نام رخ را تایپ کنید..."
          />
        </div>
        <div className="min-h-[100px] flex items-center justify-center text-muted-foreground text-sm">
          نتیجه‌ای یافت نشد
        </div>
      </DialogContent>
    </Dialog>
  );
}
