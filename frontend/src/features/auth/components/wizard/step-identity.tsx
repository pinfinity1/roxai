"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useIdentifyUser, useSendOtp } from "@/lib/api/auth/auth"; // ✅ useSendOtp اضافه شد
import { identitySchema, IdentityFormValues } from "../../schemas";
import { AuthStep } from "../auth-wizard";
import { cn } from "@/lib/utils";

interface StepIdentityProps {
  onNext: (step: AuthStep, identifier: string) => void;
}

export function StepIdentity({ onNext }: StepIdentityProps) {
  const { mutateAsync: identifyUser } = useIdentifyUser();
  const { mutateAsync: sendOtp } = useSendOtp(); // ✅ هوک ارسال پیامک

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: IdentityFormValues) => {
    try {
      // 1. تشخیص وضعیت کاربر
      const response = await identifyUser({
        data: { identifier: values.identifier },
      });

      if (response.next_step === "password") {
        // اگر پسورد دارد، برو به صفحه پسورد
        onNext("LOGIN_PASSWORD", values.identifier);
      } else {
        // ✅ اگر کاربر جدید است یا نیاز به OTP دارد، اول پیامک را بفرست
        await sendOtp({ data: { identifier: values.identifier } });

        // سپس برو به صفحه وارد کردن کد
        onNext("OTP", values.identifier);
      }
    } catch (error) {
      form.setError("identifier", { message: "خطا در برقراری ارتباط با سرور" });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  شماره موبایل یا ایمیل
                </label>
                <FormControl>
                  <Input
                    {...field}
                    dir="ltr"
                    autoFocus
                    className="h-12 rounded-xl border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={cn(
              "w-full h-12 rounded-xl text-sm font-bold tracking-wide",
              "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/10",
              "transition-all duration-200 active:scale-[0.98]",
            )}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>ادامه</span>
                <ArrowLeft className="w-4 h-4 opacity-80" />
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* Separator */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/70 px-2 text-[10px] uppercase text-gray-400 font-bold tracking-widest backdrop-blur-sm">
            یا
          </span>
        </div>
      </div>

      {/* Google Button */}
      <Button
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full h-12 rounded-xl border-gray-200 bg-white/80 hover:bg-white text-gray-700 hover:text-black font-semibold transition-all hover:shadow-md"
        type="button"
      >
        ورود با Google
        <svg className="me-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </Button>
    </div>
  );
}
