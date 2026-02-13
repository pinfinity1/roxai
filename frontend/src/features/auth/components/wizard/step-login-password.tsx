// frontend/src/features/auth/components/wizard/step-login-password.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, MessageSquareText } from "lucide-react"; // آیکون جدید
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSendOtp } from "@/lib/api/auth/auth"; // ✅
import { loginSchema, LoginFormValues } from "../../schemas";

interface StepLoginPasswordProps {
  identifier: string;
  onBack: () => void;
  onSwitchToOtp: () => void; // ✅ پراپ جدید
}

export function StepLoginPassword({
  identifier,
  onBack,
  onSwitchToOtp,
}: StepLoginPasswordProps) {
  const router = useRouter();
  const { mutateAsync: sendOtp } = useSendOtp();
  const [isOtpLoading, setIsOtpLoading] = useState(false); // لودینگ دکمه دوم

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await signIn("credentials", {
        identifier: identifier,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        form.setError("password", { message: "رمز عبور اشتباه است" });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      form.setError("root", { message: "خطای سیستم" });
    }
  };

  // هندلر دکمه "ورود با کد یکبار مصرف"
  const handleOtpLogin = async () => {
    setIsOtpLoading(true);
    try {
      await sendOtp({ data: { identifier } });
      onSwitchToOtp(); // تغییر مرحله به OTP
    } catch {
      form.setError("root", { message: "خطا در ارسال کد" });
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoFocus
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-gray-200 bg-white px-4 text-center text-lg tracking-widest focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500 text-center" />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isOtpLoading}
              className="w-full h-12 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/10 transition-all active:scale-[0.98]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "ورود"
              )}
            </Button>

            {/* ✅ دکمه ورود با OTP */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOtpLogin}
              disabled={isOtpLoading || form.formState.isSubmitting}
              className="w-full h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black font-medium transition-all"
            >
              {isOtpLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <MessageSquareText className="me-2 w-4 h-4" />
                  ورود با کد یکبار مصرف
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
