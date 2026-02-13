"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/lib/api/projects/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner"; // یا هر سیستم Toast که دارید (مثلا useToast)

interface CreateRokhDialogProps {
  children?: React.ReactNode; // دکمه‌ای که دیالوگ را باز می‌کند
}

export function CreateRokhDialog({ children }: CreateRokhDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const router = useRouter();

  // استفاده از هوک API برای ساخت پروژه
  const { mutate: createProject, isPending } = useCreateProject({
    mutation: {
      onSuccess: (data) => {
        toast.success("پروژه با موفقیت ساخته شد");
        setOpen(false);
        setTitle("");
        // رفرش کردن دیتا یا ریدارکت به صفحه ادیتور
        // router.push(`/editor/${data.id}`);
      },
      onError: (error) => {
        toast.error("خطا در ساخت پروژه. لطفاً مجدداً تلاش کنید.");
        console.error(error);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      data: { title: title },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            رخ جدید
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>ساخت رخ جدید</DialogTitle>
            <DialogDescription>
              یک عنوان برای ارائه خود انتخاب کنید. نگران نباشید، بعداً می‌توانید
              آن را تغییر دهید.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-right">
                عنوان رخ
              </Label>
              <Input
                id="name"
                placeholder="مثلاً: ارائه استارتاپ هوشمند..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ساخت رخ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
