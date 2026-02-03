// frontend/src/features/auth/components/auth-wizard.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { StepIdentity } from "./wizard/step-identity";
import { StepLoginPassword } from "./wizard/step-login-password";
import { StepOtp } from "./wizard/step-otp";
import { StepRegister } from "./wizard/step-register";

export type AuthStep =
  | "IDENTITY"
  | "OTP"
  | "LOGIN_PASSWORD"
  | "REGISTER_PASSWORD";

export function AuthWizard() {
  const [step, setStep] = useState<AuthStep>("IDENTITY");
  const [identifier, setIdentifier] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-white/70 backdrop-blur-2xl ring-1 ring-white/80 shadow-2xl shadow-gray-200/50">
      <div className="px-8 py-10">
        <div className="mb-10 flex justify-center">
          <BrandLogo size="md" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === "IDENTITY" && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <StepIdentity
                onNext={(nextStep, id) => {
                  setIdentifier(id);
                  setStep(nextStep);
                }}
              />
            </motion.div>
          )}

          {step === "LOGIN_PASSWORD" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StepLoginPassword
                identifier={identifier}
                onBack={() => setStep("IDENTITY")}
                onSwitchToOtp={() => setStep("OTP")}
              />
            </motion.div>
          )}

          {step === "OTP" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StepOtp
                identifier={identifier}
                onBack={() => setStep("IDENTITY")}
                onSuccess={(token) => {
                  setVerificationToken(token);
                  setStep("REGISTER_PASSWORD");
                }}
              />
            </motion.div>
          )}

          {step === "REGISTER_PASSWORD" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StepRegister
                identifier={identifier}
                verificationToken={verificationToken}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
