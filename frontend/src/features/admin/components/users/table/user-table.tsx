"use client";

import { Wallet, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminUserListItem } from "@/lib/api/model";
import { UserTableActions } from "./user-table-actions";
import { useRouter } from "next/navigation";
import { CreditAdjustDialog } from "../dialogs/credit-adjust-dialog"; // ✅ New
import { ImpersonateDialog } from "../dialogs/impersonate-dialog"; // ✅ New

interface UserTableProps {
  data: AdminUserListItem[];
  isLoading: boolean;
}

export function UserTable({ data, isLoading }: UserTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-muted-foreground animate-pulse">
        در حال بارگذاری لیست کاربران...
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
        کاربری یافت نشد.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-[250px] text-right">کاربر</TableHead>
            <TableHead className="text-right">نقش</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-left font-mono">
              اعتبار (تومان)
            </TableHead>
            <TableHead className="text-center w-[150px]">دسترسی سریع</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id} className="group hover:bg-gray-50/50">
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-900 truncate dir-ltr text-right">
                    {user.email || user.mobile}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "destructive" : "secondary"}
                >
                  {user.role}
                </Badge>
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs font-medium ${user.is_active ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {user.is_active ? "فعال" : "غیرفعال"}
                </span>
              </TableCell>

              <TableCell className="text-left font-mono font-bold">
                {user.credit?.toLocaleString() ?? 0}
              </TableCell>

              {/* ✅ استفاده از کامپوننت‌های جدید */}
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <CreditAdjustDialog
                    userId={user.id}
                    onSuccess={() => router.refresh()}
                    trigger={
                      <Button
                        size="icon-xs"
                        variant="outline"
                        className="h-8 w-8 text-emerald-600 border-emerald-200"
                      >
                        <Wallet className="w-4 h-4" />
                      </Button>
                    }
                  />

                  <ImpersonateDialog
                    userId={user.id}
                    trigger={
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-orange-600"
                      >
                        <Ghost className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>

              <TableCell>
                <UserTableActions
                  user={user}
                  onRefresh={() => router.refresh()}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
