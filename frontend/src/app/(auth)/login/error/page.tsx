"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "مشکلی در تنظیمات سرور/سرویس‌دهنده وجود دارد. لطفاً بعداً تلاش کنید.",
  AccessDenied: "شما اجازه دسترسی به این بخش را ندارید.",
  Verification: "لینک تأیید منقضی شده یا قبلاً استفاده شده است.",
  Default: "یک خطای غیرمنتظره رخ داده است.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const message =
    error && ERROR_MESSAGES[error]
      ? ERROR_MESSAGES[error]
      : ERROR_MESSAGES.Default;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 font-vazir">
          خطا در ورود
        </h2>

        <p className="mt-2 text-sm text-gray-500 font-vazir leading-6">
          {message}
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all font-vazir"
          >
            بازگشت به صفحه ورود
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-xs text-gray-400 font-mono ltr">
            Error Code: {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
