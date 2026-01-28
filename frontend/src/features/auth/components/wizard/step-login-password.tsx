"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
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
import { loginSchema, LoginFormValues } from "../../schemas";

interface StepLoginPasswordProps {
  identifier: string;
  onBack: () => void;
}

export function StepLoginPassword({
  identifier,
  onBack,
}: StepLoginPasswordProps) {
  const router = useRouter();

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
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      form.setError("root", { message: "خطای سیستم" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">خوش آمدید</h2>
        <p className="text-sm text-gray-500">
          رمز عبور برای{" "}
          <span className="font-semibold text-gray-800 dir-ltr">
            {identifier}
          </span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    // استایل iOS: پس‌زمینه خاکستری، بدون بردر، متن وسط‌چین
                    className="h-14 rounded-2xl bg-gray-100 border-0 text-center text-lg px-4 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </FormControl>
                <FormMessage className="text-center text-red-500 font-medium text-xs" />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-14 rounded-2xl bg-black text-white hover:bg-gray-800 text-base font-semibold shadow-none transition-transform active:scale-[0.98]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "ورود"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-12 text-gray-500 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100"
            >
              تغییر حساب کاربری
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
