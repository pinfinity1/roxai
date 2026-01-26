"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react"; // آیکون لودینگ اضافه شد
import {
  useIdentifyUser,
  useSendOtp,
  useVerifyOtp,
  useRegisterUser,
} from "@/lib/api/auth/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- Schemas ---
const identitySchema = z.object({
  identifier: z.string().min(4, "ایمیل یا شماره موبایل معتبر وارد کنید"),
});

const otpSchema = z.object({
  code: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
});

const registerSchema = z.object({
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// --- Types ---
type Step = "IDENTITY" | "OTP" | "REGISTER_PASSWORD" | "LOGIN_PASSWORD";

export function LoginForm() {
  const [step, setStep] = useState<Step>("IDENTITY");
  const [identifier, setIdentifier] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  // استیت برای لودینگ گوگل
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();

  // --- API Hooks ---
  const { mutateAsync: identify } = useIdentifyUser();
  const { mutateAsync: sendOtp } = useSendOtp();
  const { mutateAsync: verifyOtp } = useVerifyOtp();
  const { mutateAsync: register } = useRegisterUser();
  // نکته: useLoginUser را حذف کردیم چون لاگین نهایی با NextAuth انجام می‌شود

  // --- Forms ---
  const identityForm = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: { identifier: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: "", firstName: "", lastName: "" },
  });

  // --- Handlers ---

  // 0. Google Login
  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // این تابع کاربر را به گوگل می‌فرستد و سپس به /dashboard برمی‌گرداند
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google Auth Error", error);
      setIsGoogleLoading(false);
    }
  };

  // 1. Identify User
  const onIdentifySubmit = async (values: z.infer<typeof identitySchema>) => {
    try {
      const res = await identify({ data: { identifier: values.identifier } });
      const { next_step } = res.data;

      setIdentifier(values.identifier);

      if (next_step === "password") {
        setStep("LOGIN_PASSWORD");
      } else {
        await sendOtp({ data: { identifier: values.identifier } });
        setStep("OTP");
      }
    } catch (error) {
      identityForm.setError("identifier", {
        message: "خطا در برقراری ارتباط یا ورودی نامعتبر",
      });
    }
  };

  // 2. Verify OTP
  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      const res = await verifyOtp({
        data: { identifier, code: values.code },
      });
      setVerificationToken(res.data.verification_token);
      setStep("REGISTER_PASSWORD");
    } catch (error) {
      otpForm.setError("code", { message: "کد وارد شده اشتباه یا منقضی است" });
    }
  };

  // 3. Register (Set Password)
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      // ثبت‌نام در بک‌‌اند
      await register({
        data: {
          verification_token: verificationToken,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      });

      // لاگین خودکار با NextAuth بعد از ثبت‌نام
      const result = await signIn("credentials", {
        identifier: identifier,
        password: values.password,
        redirect: false,
      });

      if (!result?.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // اگر به هر دلیلی لاگین نشد، به صفحه لاگین هدایت شود
        setStep("LOGIN_PASSWORD");
      }
    } catch (error) {
      passwordForm.setError("password", { message: "خطا در ثبت‌نام" });
    }
  };

  // 4. Login (Existing User)
  const onLoginSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const result = await signIn("credentials", {
        identifier: identifier,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        passwordForm.setError("password", {
          message: "رمز عبور اشتباه است",
        });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      passwordForm.setError("password", { message: "خطای سیستم" });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md overflow-hidden shadow-lg border-0 sm:border">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800">
            {step === "IDENTITY" && "ورود به سیستم"}
            {step === "OTP" && "تایید شماره موبایل"}
            {step === "REGISTER_PASSWORD" && "تکمیل اطلاعات"}
            {step === "LOGIN_PASSWORD" && "خوش‌آمدید"}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {step === "IDENTITY" &&
              "برای شروع، ایمیل یا شماره موبایل خود را وارد کنید"}
            {step === "OTP" && (
              <span dir="ltr">Code sent to: {identifier}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* دکمه ورود با گوگل - فقط در مرحله اول */}
          {step === "IDENTITY" && (
            <div className="mb-6 space-y-4">
              <Button
                variant="outline"
                type="button"
                className="w-full h-11 relative"
                onClick={onGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
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
                )}
                {isGoogleLoading ? "در حال اتصال..." : "ورود با گوگل"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    یا ورود با شناسه
                  </span>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: IDENTITY */}
            {step === "IDENTITY" && (
              <motion.div
                key="identity"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Form {...identityForm}>
                  <form
                    onSubmit={identityForm.handleSubmit(onIdentifySubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={identityForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره موبایل یا ایمیل</FormLabel>
                          <FormControl>
                            <Input
                              dir="ltr"
                              className="text-left placeholder:text-right"
                              placeholder="0912..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={identityForm.formState.isSubmitting}
                    >
                      {identityForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "ادامه"
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === "OTP" && (
              <motion.div
                key="otp"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={otpForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کد تایید</FormLabel>
                          <FormControl>
                            <Input
                              className="text-center tracking-[0.5em] text-lg font-mono"
                              maxLength={6}
                              placeholder="------"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={otpForm.formState.isSubmitting}
                    >
                      {otpForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "تایید کد"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep("IDENTITY")}
                    >
                      تغییر شماره
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* STEP 3: REGISTER PASSWORD */}
            {step === "REGISTER_PASSWORD" && (
              <motion.div
                key="register"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تعیین رمز عبور</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={passwordForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نام خانوادگی</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "تکمیل ثبت‌نام"
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* STEP 4: LOGIN PASSWORD */}
            {step === "LOGIN_PASSWORD" && (
              <motion.div
                key="login"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز عبور</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "ورود"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full"
                      onClick={() => setStep("IDENTITY")}
                    >
                      بازگشت
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
