// frontend/src/features/auth/components/wizard/step-identity.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useIdentifyUser, useSendOtp } from "@/lib/api/auth/auth";
import { identitySchema, IdentityFormValues } from "../../schemas";
import { AuthStep } from "../login-form";

export function StepIdentity({
  onSuccess,
}: {
  onSuccess: (s: AuthStep, i: string) => void;
}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { mutateAsync: identify } = useIdentifyUser();
  const { mutateAsync: sendOtp } = useSendOtp();

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: IdentityFormValues) => {
    try {
      const res = await identify({ data: { identifier: values.identifier } });
      const { next_step } = res.data;

      if (next_step === "password") {
        onSuccess("LOGIN_PASSWORD", values.identifier);
      } else {
        await sendOtp({ data: { identifier: values.identifier } });
        onSuccess("OTP", values.identifier);
      }
    } catch {
      form.setError("identifier", { message: "ارتباط با سرور برقرار نشد" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        {/* تیتر کاملاً رسمی و بدون حاشیه */}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          ورود یا ثبت‌نام
        </h2>
        <p className="text-sm text-gray-500">
          برای ادامه، شماره موبایل یا ایمیل خود را وارد کنید
        </p>
      </div>

      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      dir="ltr"
                      className="h-14 rounded-2xl bg-gray-100 border-0 text-lg text-center px-4 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:bg-white transition-all shadow-inner font-mono"
                      placeholder="0912..."
                    />
                  </FormControl>
                  <FormMessage className="text-center text-xs text-red-600 font-medium" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black text-base font-medium shadow-none transition-all active:scale-[0.98]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "ادامه"
              )}
            </Button>
          </form>
        </Form>

        {/* دیوایدر ساده‌تر */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">یا</span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-14 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={isGoogleLoading}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
          ورود با گوگل
        </Button>
      </div>
    </motion.div>
  );
}
