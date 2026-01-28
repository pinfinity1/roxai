import { z } from "zod";

export const identitySchema = z.object({
  identifier: z.string().min(4, "لطفا ایمیل یا شماره موبایل معتبر وارد کنید"),
});

export const otpSchema = z.object({
  code: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
});

export const registerSchema = z.object({
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  password: z.string().min(1, "لطفا رمز عبور را وارد کنید"),
});

export type IdentityFormValues = z.infer<typeof identitySchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
