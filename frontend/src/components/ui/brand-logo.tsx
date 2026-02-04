"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeConfig = {
    sm: { text: "text-2xl", gemSize: "size-2", gemBottom: "-top-1" },
    md: { text: "text-4xl", gemSize: "size-3", gemBottom: "-top-2" },
    lg: { text: "text-6xl", gemSize: "size-4", gemBottom: "-top-3" },
    xl: { text: "text-8xl", gemSize: "size-6", gemBottom: "-top-4" },
  };

  const config = sizeConfig[size];

  // پالت رنگی نهایی (Teal + Slate)
  const textGradient =
    "from-slate-800 via-teal-950 to-slate-900 dark:from-slate-100 dark:via-teal-50 dark:to-slate-300";
  const gemGradient = "bg-gradient-to-tr from-teal-500 to-cyan-400";

  return (
    <motion.div
      dir="ltr"
      className={cn(
        "font-black tracking-tighter select-none flex items-baseline font-sans relative cursor-default group pt-3 pb-2",
        config.text,
        className,
      )}
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* بخش اول: Roxa */}
      <span
        className={cn(
          "bg-clip-text text-transparent bg-gradient-to-b", // pb-2 برای جلوگیری از کلیپ شدن
          textGradient,
        )}
      >
        Roxa
      </span>

      {/* بخش دوم: i با الماس */}
      <div className="relative flex flex-col items-center mx-[1px]">
        {/* 💎 The Diamond */}
        <motion.div
          className={cn(
            "absolute left-0 right-0 mx-auto z-10 rounded-[1px]",
            config.gemSize, // سایز داینامیک (درست)
            config.gemBottom, // پوزیشن داینامیک (درست)
            gemGradient,
            "shadow-sm shadow-teal-500/20",
          )}
          style={{ rotate: 45 }}
          whileHover={{
            rotate: 225,
            scale: 1.2,
            filter: "drop-shadow(0 0 8px rgba(45, 212, 191, 0.5))",
          }}
          transition={{ duration: 0.4, ease: "backOut" }}
        />

        {/* بدنه حرف i */}
        <span
          className={cn(
            "bg-clip-text text-transparent bg-gradient-to-b", // pb-2 اضافه شد
            textGradient,
          )}
        >
          ı
        </span>
      </div>
    </motion.div>
  );
}
