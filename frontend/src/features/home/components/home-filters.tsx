// frontend/src/features/home/components/home-filters.tsx
"use client";

import { Clock, User, Star, LayoutGrid, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// اضافه کردن type به ورودی‌ها برای تصمیم‌گیری
interface HomeFiltersProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  type: "all" | "shared" | "trash" | "folder"; // ✅ اضافه شد
}

export function HomeFilters({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  type, // ✅ دریافت تایپ
}: HomeFiltersProps) {
  // منطق: تب "ساخته‌های من" فقط وقتی نشان داده شود که در صفحه اصلی یا پوشه باشیم
  // در حالت "shared" معنی ندارد
  const showYoursTab = type !== "shared";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-1">
      <Tabs
        value={activeTab}
        className="w-full sm:w-auto"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-transparent p-0 h-auto gap-2">
          {/* فیلتر "همه" همیشه هست */}
          <FilterTab value="all" label="همه" />

          {/* فیلتر "اخیراً" همیشه هست */}
          <FilterTab
            value="recent"
            label="اخیراً"
            icon={<Clock className="w-4 h-4" />}
          />

          {/* ✅ فیلتر شرطی: فقط اگر در shared نبودیم نشان بده */}
          {showYoursTab && (
            <FilterTab
              value="yours"
              label="ساخته‌های من"
              icon={<User className="w-4 h-4" />}
            />
          )}

          {/* فیلتر "نشان‌شده‌ها" همیشه هست (چون ممکنه پروژه اشتراکی رو استار کنید) */}
          <FilterTab
            value="favorites"
            label="نشان‌شده‌ها"
            icon={<Star className="w-4 h-4" />}
          />
        </TabsList>
      </Tabs>

      {/* View Toggle (بدون تغییر) */}
      <div className="flex items-center bg-muted/50 p-1 rounded-lg self-end sm:self-auto">
        <ViewToggleButton
          active={viewMode === "grid"}
          onClick={() => setViewMode("grid")}
          icon={<LayoutGrid className="size-4" />}
        />
        <ViewToggleButton
          active={viewMode === "list"}
          onClick={() => setViewMode("list")}
          icon={<ListIcon className="size-4" />}
        />
      </div>
    </div>
  );
}

// ... (توابع کمکی FilterTab و ViewToggleButton بدون تغییر)
function FilterTab({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="border-transparent px-4 p-3 font-medium text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-primary transition-all hover:text-foreground bg-transparent gap-2 cursor-pointer"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 w-7 p-0 rounded-md transition-all",
        active
          ? "bg-background shadow-sm text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
    </Button>
  );
}
