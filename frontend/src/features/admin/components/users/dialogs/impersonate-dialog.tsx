"use client";

import { useState } from "react";
import { useImpersonateUser } from "@/lib/api/admin-console/admin-console";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ghost, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImpersonateDialogProps {
  userId: string;
  trigger: React.ReactNode;
}

export function ImpersonateDialog({ userId, trigger }: ImpersonateDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate: impersonate, isPending } = useImpersonateUser();

  const handleImpersonate = () => {
    if (!reason || reason.length < 3) {
      toast.error("دلیل ورود الزامی است");
      return;
    }

    const toastId = toast.loading("در حال ورود امن به حساب کاربر...");

    impersonate(
      {
        // ✅ این اندپوینت Path Param ندارد، همه چیز در Body است
        data: {
          target_user_id: userId, // نام فیلد در ImpersonateRequest
          reason: reason,
        },
      },
      {
        onSuccess: (response) => {
          toast.success("ورود موفقیت آمیز بود", { id: toastId });
          // ریدایرکت با توکن دریافتی
          window.location.href = response.redirect_url;
        },
        onError: () => toast.error("خطا در جعل هویت", { id: toastId }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] border-orange-500/50"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Ghost className="w-5 h-5" />
            جعل هویت
          </DialogTitle>
          <DialogDescription>
            شما با دسترسی کامل وارد حساب این کاربر می‌شوید. تمام اقدامات شما لاگ
            خواهد شد.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-orange-50 p-3 rounded-md border border-orange-100 flex gap-2 items-start text-xs text-orange-800 mb-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>توکن صادر شده موقت است. لطفاً فقط برای دیباگ استفاده کنید.</p>
        </div>

        <div className="grid gap-2 py-2">
          <Label>دلیل ورود (اجباری)</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            انصراف
          </Button>
          <Button
            onClick={handleImpersonate}
            disabled={isPending || !reason}
            variant="destructive"
          >
            {isPending && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
            ورود
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
