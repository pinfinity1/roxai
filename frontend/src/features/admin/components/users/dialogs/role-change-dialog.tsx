"use client";

import { useState } from "react";
import { useChangeUserRole } from "@/lib/api/admin-console/admin-console";
import { UserRole } from "@/lib/api/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

interface RoleChangeDialogProps {
  userId: string;
  currentRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "guest", label: "مهمان (Guest)", desc: "دسترسی محدود" },
  { value: "free", label: "کاربر عادی (Free)", desc: "دسترسی پایه" },
  { value: "pro", label: "حرفه‌ای (Pro)", desc: "دسترسی کامل" },
  { value: "support", label: "پشتیبان (Support)", desc: "پنل ادمین محدود" },
  { value: "admin", label: "مدیر کل (Admin)", desc: "دسترسی کامل" },
];

export function RoleChangeDialog({
  userId,
  currentRole,
  open,
  onOpenChange,
  onSuccess,
}: RoleChangeDialogProps) {
  const [role, setRole] = useState<UserRole>(currentRole as UserRole);
  const [reason, setReason] = useState("");

  const { mutate: changeRole, isPending } = useChangeUserRole();

  const handleSubmit = () => {
    if (!reason || reason.length < 5) {
      toast.error("لطفاً دلیل تغییر نقش را بنویسید (حداقل ۵ کاراکتر)");
      return;
    }

    const toastId = toast.loading("در حال تغییر سطح دسترسی...");

    changeRole(
      {
        data: {
          target_user_id: userId,
          new_role: role,
          reason_note: reason,
        },
      },
      {
        onSuccess: () => {
          toast.success("نقش کاربر با موفقیت تغییر کرد", { id: toastId });
          onOpenChange(false);
          setReason("");
          onSuccess?.();
        },
        onError: () => {
          toast.error("خطا در تغییر نقش. دسترسی کافی ندارید.", { id: toastId });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-5 h-5" />
            تغییر سطح دسترسی کاربر
          </DialogTitle>
          <DialogDescription>
            تغییر نقش دسترسی‌های کاربر را فوراً تغییر می‌دهد.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>نقش جدید</Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as UserRole)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-row-reverse gap-2 items-center">
                      <span className="font-bold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.desc}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>دلیل تغییر (اجباری)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !reason}
            variant="destructive"
          >
            {isPending && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
            اعمال تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
