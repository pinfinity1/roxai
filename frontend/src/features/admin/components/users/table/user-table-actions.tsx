"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, Wallet, Ghost, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminUserListItem } from "@/lib/api/model"; // یا schemas/admin اگر تغییر کرده
import { RoleChangeDialog } from "../dialogs/role-change-dialog";
import { CreditAdjustDialog } from "../dialogs/credit-adjust-dialog";
import { ImpersonateDialog } from "../dialogs/impersonate-dialog";
import { useRouter } from "next/navigation";

// ✅ اصلاح اینترفیس: حذف onImpersonate و onCreditAdjust
interface UserTableActionsProps {
  user: AdminUserListItem;
  onRefresh: () => void;
}

export function UserTableActions({ user, onRefresh }: UserTableActionsProps) {
  const router = useRouter();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">باز کردن منو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>عملیات‌ها</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            <Eye className="ml-2 h-4 w-4" />
            مشاهده جزئیات
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* مدیریت مالی */}
          <div onSelect={(e) => e.preventDefault()}>
            <CreditAdjustDialog
              userId={user.id}
              onSuccess={onRefresh}
              trigger={
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground w-full">
                  <Wallet className="ml-2 h-4 w-4" />
                  مدیریت مالی
                </div>
              }
            />
          </div>

          {/* جعل هویت */}
          <div onSelect={(e) => e.preventDefault()}>
            <ImpersonateDialog
              userId={user.id}
              trigger={
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground w-full text-orange-700">
                  <Ghost className="ml-2 h-4 w-4" />
                  جعل هویت
                </div>
              }
            />
          </div>

          <DropdownMenuSeparator />

          {/* تغییر نقش */}
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            <Shield className="ml-2 h-4 w-4 text-rose-600" />
            تغییر نقش
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleChangeDialog
        userId={user.id}
        currentRole={user.role}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
