"use client";

import { useState } from "react";
import { useAdjustUserCredit } from "@/lib/api/admin-console/admin-console";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";

interface CreditAdjustDialogProps {
  userId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function CreditAdjustDialog({
  userId,
  trigger,
  onSuccess,
}: CreditAdjustDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");

  const { mutate: adjustCredit, isPending } = useAdjustUserCredit();

  const handleSubmit = () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      toast.error("مبلغ نامعتبر است");
      return;
    }
    if (!reason || reason.length < 5) {
      toast.error("توضیحات تراکنش الزامی است (حداقل ۵ کاراکتر)");
      return;
    }

    adjustCredit(
      {
        data: {
          // ✅ طبق مدل CreditAdjustmentRequest در بک‌اند
          target_user_id: userId,
          amount: numAmount,
          reason_note: reason,
        },
      },
      {
        onSuccess: () => {
          toast.success("تراکنش با موفقیت ثبت شد");
          setOpen(false);
          setAmount("");
          setReason("");
          onSuccess?.();
        },
        onError: () => toast.error("خطا در ثبت تراکنش"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <Wallet className="w-5 h-5" />
            تغییر اعتبار کاربر
          </DialogTitle>
          <DialogDescription>
            این مبلغ مستقیماً به کیف پول کاربر اضافه (یا کم) می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>مبلغ (تومان)</Label>
            <Input
              type="number"
              placeholder="مثلا: 50000 یا -20000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono text-left"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              برای کسر اعتبار از عدد منفی استفاده کنید.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>دلیل تراکنش (اجباری)</Label>
            <Textarea
              placeholder="مثلا: هدیه خوش‌آمدگویی، بازگشت وجه و..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !amount || !reason}
          >
            {isPending && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
            ثبت تراکنش
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
