// frontend/src/features/auth/components/wizard/step-register.tsx
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
import { useRegisterUser } from "@/lib/api/auth/auth";
import { registerSchema, RegisterFormValues } from "../../schemas";

export function StepRegister({
  identifier,
  verificationToken,
}: {
  identifier: string;
  verificationToken: string;
}) {
  const router = useRouter();
  const { mutateAsync: register } = useRegisterUser();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: "", firstName: "", lastName: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        data: {
          verification_token: verificationToken,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      });
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
      form.setError("root", { message: "خطایی رخ داد" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">ایجاد حساب کاربری</h2>
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
                      className="h-14 rounded-2xl bg-gray-100 border-0 px-4 text-center placeholder:text-gray-400"
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
                      className="h-14 rounded-2xl bg-gray-100 border-0 px-4 text-center placeholder:text-gray-400"
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
                    className="h-14 rounded-2xl bg-gray-100 border-0 px-4 text-center placeholder:text-gray-400"
                    placeholder="رمز عبور (حداقل ۸ رقم)"
                  />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "ساخت حساب"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
