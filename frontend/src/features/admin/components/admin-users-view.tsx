"use client";

import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserListHeader } from "./user-list-header";
import { UserTable } from "./user-table";
import { useAdminUsers } from "../hooks/use-admin-users";

export function AdminUsersView() {
  const {
    users,
    totalPages,
    page,
    setPage,
    searchTerm,
    handleSearchChange,
    isLoadingUsers,
    isImpersonating,
    isAdjusting,
    handleImpersonate,
    handleCreditAdjustment,
  } = useAdminUsers();

  return (
    <div
      className="p-8 space-y-8 font-vazir min-h-screen bg-gray-50/50"
      dir="rtl"
    >
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          کنسول عملیات ویژه
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          مدیریت کاربران و عملیات حساس سیستم
        </p>
      </div>

      {/* Search & Filter */}
      <UserListHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        isLoading={isLoadingUsers}
      />

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <UserTable
          users={users}
          isLoading={isLoadingUsers}
          isActionLoading={isImpersonating || isAdjusting}
          onImpersonate={handleImpersonate}
          onCreditAdjust={handleCreditAdjustment}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <span className="text-xs text-gray-500">
            صفحه {page} از {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoadingUsers}
            >
              <ChevronRight className="w-4 h-4" /> قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoadingUsers}
            >
              بعدی <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
