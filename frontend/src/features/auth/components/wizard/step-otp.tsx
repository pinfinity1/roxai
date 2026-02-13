// frontend/src/features/auth/components/wizard/step-otp.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useVerifyOtp, useSendOtp } from "@/lib/api/auth/auth";
import { otpSchema, OtpFormValues } from "../../schemas";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StepOtpProps {
  identifier: string;
  onBack: () => void;
  onSuccess: (token: string) => void;
}

export function StepOtp({ identifier, onBack, onSuccess }: StepOtpProps) {
  const router = useRouter();
  const { mutateAsync: verifyOtp } = useVerifyOtp();
  const { mutateAsync: sendOtp } = useSendOtp();
  const [timer, setTimer] = useState(120);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    try {
      await sendOtp({ data: { identifier } });
      setTimer(120);
    } catch {}
  };

  const onSubmit = async (values: OtpFormValues) => {
    try {
      // @ts-ignore - چون ریسپانس جدید شامل action و توکن است
      const res = await verifyOtp({ data: { identifier, code: values.code } });

      // ✅ سناریو ۱: لاگین موفق (کاربر قدیمی)
      if (res.action === "login" && res.access_token) {
        await signIn("credentials", {
          token: JSON.stringify({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
            expires_in: res.expires_in,
          }),
          user_json: JSON.stringify(res.user),
          redirect: false,
        });
        router.push("/");
        router.refresh();
      } else if (res.verification_token) {
        onSuccess(res.verification_token);
      }
    } catch (error) {
      form.setError("code", { message: "کد وارد شده صحیح نیست" });
    }
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium text-gray-500">
            رمز عبور برای
          </span>
          <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">
            {identifier}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="text-gray-400 hover:text-gray-900"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative w-full h-14 direction-ltr">
                    <input
                      {...field}
                      autoFocus
                      autoComplete="one-time-code" // برای پر شدن خودکار از SMS در iOS/Android
                      maxLength={6}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 font-mono tracking-[1em]"
                      inputMode="numeric"
                      onChange={(e) => {
                        // 1. فقط اجازه ورود اعداد
                        const value = e.target.value.replace(/[^0-9]/g, "");

                        // 2. آپدیت استیت فرم
                        field.onChange(value);

                        // 3. ✅ Auto-Submit Logic
                        if (value.length === 6) {
                          // استفاده از requestAnimationFrame برای اطمینان از آپدیت شدن استیت قبل از سابمیت
                          requestAnimationFrame(() => {
                            form.handleSubmit(onSubmit)();
                          });

                          // اختیاری: بلور کردن اینپوت برای بستن کیبورد موبایل
                          e.target.blur();
                        }
                      }}
                    />

                    <div
                      className="absolute inset-0 flex justify-between gap-2 z-10 pointer-events-none"
                      dir="ltr"
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const char = field.value?.[index] || "";
                        const isActive = field.value?.length === index;
                        const isFilled = field.value?.length > index;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex-1 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 bg-white/50 backdrop-blur-sm",
                              isActive
                                ? "border-blue-500 ring-4 ring-blue-500/10 scale-105 bg-white text-blue-600"
                                : isFilled
                                  ? "border-gray-300 bg-white text-gray-900"
                                  : "border-gray-100 bg-gray-50 text-gray-300",
                            )}
                          >
                            {char}
                            {isActive && (
                              <span className="absolute w-0.5 h-6 bg-blue-500 animate-blink" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </FormControl>
                <div className="min-h-[20px] text-center">
                  <FormMessage className="text-xs font-medium text-red-500" />
                </div>
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting || form.watch("code")?.length !== 6
              }
              className={cn(
                "w-full h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98]",
                "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10",
                "disabled:opacity-50 disabled:shadow-none",
              )}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "تایید و ادامه"
              )}
            </Button>

            <div className="text-center">
              {timer > 0 ? (
                <span className="text-xs text-gray-400 font-mono">
                  ارسال مجدد در {formatTime(timer)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </div>
        </form>
      </Form>

      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}
