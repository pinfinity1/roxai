// frontend/src/features/auth/components/login-form.tsx
"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";

// استپ‌ها
import { StepIdentity } from "./wizard/step-identity";
import { StepOtp } from "./wizard/step-otp";
import { StepRegister } from "./wizard/step-register";
import { StepLoginPassword } from "./wizard/step-login-password";

export type AuthStep =
  | "IDENTITY"
  | "OTP"
  | "REGISTER_PASSWORD"
  | "LOGIN_PASSWORD";

export function LoginForm() {
  const [step, setStep] = useState<AuthStep>("IDENTITY");
  const [identifier, setIdentifier] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] p-4 font-vazir">
      {/* رنگ پس‌زمینه: #F2F2F7 (رنگ استاندارد iOS Grouped Background)
        بدون هیچ افکت اضافه. تمیزی مطلق.
      */}

      <div className="w-full max-w-[400px]">
        {/* لوگوی یا نام برند بالای کارت */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Roxai
          </h1>
        </div>

        <Card className="overflow-hidden rounded-[24px] border-0 bg-white shadow-sm ring-1 ring-black/5">
          <div className="p-8">
            <AnimatePresence mode="wait" initial={false}>
              {step === "IDENTITY" && (
                <StepIdentity
                  key="identity"
                  onSuccess={(nextStep, id) => {
                    setIdentifier(id);
                    setStep(nextStep);
                  }}
                />
              )}

              {step === "OTP" && (
                <StepOtp
                  key="otp"
                  identifier={identifier}
                  onBack={() => setStep("IDENTITY")}
                  onSuccess={(token) => {
                    setVerificationToken(token);
                    setStep("REGISTER_PASSWORD");
                  }}
                />
              )}

              {step === "REGISTER_PASSWORD" && (
                <StepRegister
                  key="register"
                  identifier={identifier}
                  verificationToken={verificationToken}
                />
              )}

              {step === "LOGIN_PASSWORD" && (
                <StepLoginPassword
                  key="login-password"
                  identifier={identifier}
                  onBack={() => setStep("IDENTITY")}
                />
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
