// frontend/src/features/auth/components/wizard/step-register.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRegisterUser } from "@/lib/api/auth/auth";
import { registerSchema, RegisterFormValues } from "../../schemas";

interface StepRegisterProps {
  identifier: string;
  verificationToken: string;
}

export function StepRegister({
  identifier,
  verificationToken,
}: StepRegisterProps) {
  const router = useRouter();
  const { mutateAsync: register } = useRegisterUser();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: "", firstName: "", lastName: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // 1. ثبت نام در بک‌ند
      await register({
        data: {
          verification_token: verificationToken,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      });

      // 2. لاگین خودکار بعد از ثبت‌نام موفق
      const result = await signIn("credentials", {
        identifier,
        password: values.password,
        redirect: false,
      });

      if (!result?.error) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      form.setError("root", { message: "خطا در ثبت اطلاعات" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 mb-6">
        <h3 className="text-lg font-bold text-gray-900">تکمیل ثبت‌نام</h3>
        <p className="text-xs text-gray-500">
          اطلاعات حساب کاربری خود را وارد کنید
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-xl border-gray-200 bg-white px-4 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all text-sm"
                      placeholder="نام"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-xl border-gray-200 bg-white px-4 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all text-sm"
                      placeholder="نام خانوادگی"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    className="h-12 rounded-xl border-gray-200 bg-white px-4 placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all text-sm font-mono text-center tracking-widest"
                    placeholder="رمز عبور (حداقل ۸ رقم)"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 text-center" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/10 transition-all active:scale-[0.98] mt-2"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "ساخت حساب و ورود"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
