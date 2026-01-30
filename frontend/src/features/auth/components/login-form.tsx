"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StepIdentity } from "./wizard/step-identity";
import { StepOtp } from "./wizard/step-otp";
import { StepRegister } from "./wizard/step-register";
import { StepLoginPassword } from "./wizard/step-login-password";
import { BrandLogo } from "@/components/ui/brand-logo";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 font-vazir">
      {/* 🎨 Background: Luxury Teal Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-800/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="z-10 w-full max-w-[420px] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <BrandLogo size="lg" />
        </motion.div>

        {/* 💎 Glass Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-white/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/50 border border-white/20">
          <div className="relative p-8 md:p-10">
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
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            با ورود به روکسی،{" "}
            <a href="#" className="underline hover:text-gray-600">
              قوانین و مقررات
            </a>{" "}
            را می‌پذیرید.
          </p>
        </div>
      </div>
    </div>
  );
}
