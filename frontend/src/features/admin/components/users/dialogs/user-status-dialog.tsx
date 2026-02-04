"use client";

import { useState } from "react";
import { useChangeUserStatus } from "@/lib/api/admin-console/admin-console";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // اضافه شد
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Ban, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

interface UserStatusDialogProps {
  userId: string;
  isActive: boolean;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function UserStatusDialog({
  userId,
  isActive,
  trigger,
  onSuccess,
}: UserStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState(""); // استیت برای چک امنیتی

  const { mutate: changeStatus, isPending } = useChangeUserStatus();

  // اگر کاربر فعال است، اقدام ما "مسدود سازی" است که خطرناک محسوب می‌شود
  const isBanAction = isActive;

  // شرط فعال شدن دکمه: دلیل پر شده باشد + اگر بن می‌کنیم، متن تایید دقیق باشد
  const canSubmit =
    reason.length >= 5 && (!isBanAction || confirmText === "CONFIRM");

  const handleSubmit = () => {
    if (!canSubmit) return;

    const action = isBanAction ? "مسدود سازی" : "فعال سازی";
    const toastId = toast.loading(`در حال ${action} کاربر...`);

    changeStatus(
      {
        data: {
          target_user_id: userId,
          is_active: !isActive,
          reason_note: reason,
        },
      },
      {
        onSuccess: () => {
          toast.success(`کاربر با موفقیت ${isActive ? "مسدود" : "فعال"} شد`, {
            id: toastId,
          });
          setOpen(false);
          setReason("");
          setConfirmText("");
          onSuccess?.();
        },
        onError: () => toast.error("خطا در تغییر وضعیت کاربر", { id: toastId }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${isBanAction ? "text-rose-600" : "text-emerald-600"}`}
          >
            {isBanAction ? (
              <Ban className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {isBanAction ? "مسدود کردن کاربر (خطرناک)" : "فعال‌سازی مجدد کاربر"}
          </DialogTitle>
          <DialogDescription>
            {isBanAction
              ? "کاربر دسترسی به حساب خود را از دست خواهد داد. این عملیات در لاگ سیستم ثبت می‌شود."
              : "کاربر مجدداً می‌تواند وارد حساب خود شود."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>دلیل اقدام (اجباری - حداقل ۵ کاراکتر)</Label>
            <Textarea
              placeholder={
                isBanAction
                  ? "مثلا: نقض قوانین استفاده..."
                  : "مثلا: رفع سوءتفاهم..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* ✅ بخش امنیتی فقط برای بن کردن */}
          {isBanAction && (
            <div className="grid gap-2 bg-rose-50 p-3 rounded-md border border-rose-100">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                تایید امنیتی
              </div>
              <Label className="text-xs text-rose-700">
                برای تایید نهایی، کلمه{" "}
                <span className="font-mono font-black mx-1">CONFIRM</span> را
                تایپ کنید:
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="border-rose-200 focus-visible:ring-rose-500 font-mono text-center tracking-widest uppercase"
                placeholder="CONFIRM"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            variant={isBanAction ? "destructive" : "default"}
            className={
              !isBanAction ? "bg-emerald-600 hover:bg-emerald-700" : ""
            }
          >
            {isPending && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
            {isBanAction ? "تایید و مسدود سازی" : "فعال‌سازی"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
