"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useListProjects } from "@/lib/api/projects/projects"; //
import { ProjectStatus } from "@/lib/api/model"; //
import { CustomPagination } from "@/components/common/custom-pagination"; //
import { Button } from "@/components/ui/button"; //
import { Skeleton } from "@/components/ui/skeleton"; //
import { RokhCard } from "./rokh-card";
import { useDebounce } from "@/hooks/use-debounce"; //

export function RokhList() {
  // استیت‌های لوکال
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // دریافت دیتا از API
  const { data, isLoading, isError } = useListProjects(
    {
      page,
      page_size: 12,
      search: debouncedSearch || undefined,
    },
    {
      query: {
        // Polling هوشمند: اگر پروژه‌ای "در حال ساخت" است، هر 5 ثانیه رفرش کن
        refetchInterval: (query) => {
          const items = query.state.data?.items || [];
          const hasGenerating = items.some(
            (p) => p.status === ProjectStatus.generating,
          );
          return hasGenerating ? 5000 : false;
        },
      },
    },
  );

  // لودینگ (Skeleton)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-1.5 px-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ارور
  if (isError) {
    return (
      <div className="flex h-60 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-muted-foreground mt-6">
        <p>خطا در دریافت لیست رخ‌ها</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* محتوا */}
      {data?.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.items.map((project) => (
            <RokhCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* پیجینیشن */}
      {data && (
        <CustomPagination
          page={page}
          totalPages={data.total_pages}
          onChange={setPage}
          className="py-4"
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex size-20 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
        <Plus className="size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">هنوز هیچ رُخی ندارید</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          ایده‌های خود را به واقعیت تبدیل کنید. دکمه "ساخت با هوش مصنوعی" را
          بزنید.
        </p>
      </div>
    </div>
  );
}
