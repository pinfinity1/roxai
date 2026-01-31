// frontend/src/features/auth/components/wizard/step-otp.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useVerifyOtp } from "@/lib/api/auth/auth";
import { otpSchema, OtpFormValues } from "../../schemas";

export function StepOtp({
  identifier,
  onSuccess,
  onBack,
}: {
  identifier: string;
  onSuccess: (t: string) => void;
  onBack: () => void;
}) {
  const { mutateAsync: verifyOtp } = useVerifyOtp();
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const res = await verifyOtp({ data: { identifier, code: values.code } });
      onSuccess(res.verification_token);
    } catch {
      form.setError("code", { message: "کد وارد شده صحیح نیست" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-gray-900">کد تایید</h2>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>ارسال شده به {identifier}</span>
          <button
            onClick={onBack}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
          >
            <PenLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={6}
                    // استایل متمایز برای کد: فونت درشت، فاصله زیاد حروف
                    className="h-16 rounded-2xl bg-gray-100 border-0 text-3xl font-bold tracking-[0.5em] text-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white transition-all"
                    placeholder="— — — — — —" // Placeholder زیباتر
                  />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-14 rounded-2xl bg-black text-white hover:bg-gray-800 text-base font-semibold shadow-none transition-transform active:scale-[0.98]"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "تایید"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
