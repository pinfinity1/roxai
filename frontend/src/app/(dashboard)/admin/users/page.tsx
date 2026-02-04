"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListUsers } from "@/lib/api/admin-console/admin-console"; // مسیر هوک را چک کنید
import { UserRole } from "@/lib/api/model";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// Components
import { UserTable } from "@/features/admin/components/users/table/user-table";
import { UserMobileList } from "@/features/admin/components/users/table/user-mobile-list";
import { UserFilters } from "@/features/admin/components/users/table/user-filters";
import { CustomPagination } from "@/components/common/custom-pagination";

export default function UsersPage() {
  const router = useRouter();

  // 1. State Management
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<"active" | "banned" | "all">("all");

  // 2. Debounce Search (prevent API spam)
  const debouncedSearch = useDebounce(search, 500);

  // 3. Prepare Filters for API
  // تبدیل مقدار استرینگ منوی سلکت به مقدار واقعی که API می‌خواهد
  const isActiveFilter = status === "all" ? undefined : status === "active";

  // 4. API Call
  const { data, isLoading, refetch } = useListUsers({
    page,
    page_size: 50,
    query: debouncedSearch || undefined,
    role: role === "all" ? undefined : role,
    is_active: isActiveFilter,
  });

  const handleRefresh = () => {
    refetch();
    router.refresh();
  };

  const handleResetFilters = () => {
    setRole("all");
    setStatus("all");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            مدیریت کاربران
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            مشاهده لیست، تغییر سطح دسترسی و مدیریت کیف پول کاربران
          </p>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="جستجو (ایمیل، نام، موبایل)..."
              className="pr-9 bg-background"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset page on new search
              }}
            />
          </div>

          {/* Advanced Filters */}
          <UserFilters
            currentRole={role}
            currentStatus={status}
            onRoleChange={(val) => {
              setRole(val);
              setPage(1);
            }}
            onStatusChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[400px]">
        {/* Desktop View: Table */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          <UserTable
            data={data?.items ?? []}
            isLoading={isLoading}
            // مطمئن شوید UserTable پراپ onRefresh را دریافت می‌کند
            // اگر ندارد، فعلا مهم نیست چون دکمه‌های action خودشان هندل می‌کنند
          />
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden">
          <UserMobileList
            data={data?.items ?? []}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && data && data.total_pages > 1 && (
        <div className="flex justify-center py-4">
          <CustomPagination
            page={page}
            totalPages={data.total_pages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
