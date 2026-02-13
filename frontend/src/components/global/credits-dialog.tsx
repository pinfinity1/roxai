"use client";

import { Sparkles, Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CreditsDialogProps {
  children: React.ReactNode;
  balance?: number;
}

export function CreditsDialog({ children, balance = 400 }: CreditsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* dir="rtl" برای نمایش صحیح فارسی */}
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader className="flex flex-col items-center gap-2">
          {/* آیکون هدر */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2">
            <Sparkles className="size-6 fill-amber-600" />
          </div>

          {/* تایتل اجباری برای رفع ارور */}
          <DialogTitle className="text-lg font-bold text-center">
            موجودی اعتبار شما
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* نمایش موجودی */}
          <div className="text-4xl font-black text-foreground flex items-center justify-center gap-2 tracking-tight">
            {balance.toLocaleString("fa-IR")}{" "}
            <span className="text-lg font-medium text-muted-foreground">
              سکه
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed px-2">
            اعتبار (Credit) سوخت موتور هوش مصنوعی شماست. هر کاربر در فضای کار،
            کیف پول اختصاصی خود را دارد.
          </p>

          {/* باکس ارتقا (Upsell Box) */}
          <div className="w-full rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 p-4 mt-2">
            <div className="flex items-start gap-3 text-right">
              <div className="p-2 rounded-lg bg-background shadow-sm mt-1">
                <Zap className="size-4 text-indigo-600" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                  قدرت بیشتر، محدودیت کمتر
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  برای دسترسی به مدل‌های پیشرفته‌تر و ابزارهای برندینگ، طرح خود
                  را ارتقا دهید.
                </p>
              </div>
            </div>
            <Button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-xs h-9">
              <CreditCard className="ml-2 size-3.5" />
              ارتقای اشتراک
            </Button>
          </div>

          {/* سوالات متداول (Accordion) */}
          <Accordion
            type="single"
            collapsible
            className="w-full text-right"
            dir="rtl"
          >
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground hover:no-underline py-3">
                چه کارهایی اعتبار مصرف می‌کنند؟
              </AccordionTrigger>
              <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed text-right">
                ساخت اسلاید جدید، بازنویسی متن‌ها با AI و تولید تصاویر هوش
                مصنوعی از اعتبار شما کسر می‌کنند. ویرایش دستی رایگان است.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b-0">
              <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground hover:no-underline py-3">
                چقدر اعتبار دریافت می‌کنم؟
              </AccordionTrigger>
              <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed text-right">
                کاربران رایگان در ابتدای ثبت‌نام ۴۰۰ سکه دریافت می‌کنند. کاربران
                Pro ماهانه ۵۰۰۰ سکه دریافت خواهند کرد.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b-0">
              <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground hover:no-underline py-3">
                چگونه اعتبار بیشتری کسب کنم؟
              </AccordionTrigger>
              <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed text-right">
                می‌توانید با دعوت دوستان خود به Roxai اعتبار هدیه بگیرید یا
                اشتراک خود را به طرح حرفه‌ای ارتقا دهید.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
