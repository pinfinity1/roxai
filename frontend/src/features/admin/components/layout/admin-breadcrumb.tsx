"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// دیکشنری ترجمه مسیرها (برای اینکه در Breadcrumb فارسی ببینیم)
const routeLabels: Record<string, string> = {
  admin: "پنل مدیریت",
  users: "مدیریت کاربران",
  projects: "پروژه‌ها",
  features: "مدیریت ویژگی‌ها (Flags)",
  billing: "امور مالی",
  health: "سلامت سیستم",
  settings: "تنظیمات",
  create: "ایجاد جدید",
  edit: "ویرایش",
  "[id]": "جزئیات", // Fallback for dynamic routes
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // جدا کردن بخش‌های URL و حذف بخش‌های خالی
  const segments = pathname.split("/").filter((item) => item !== "");

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          // ترجمه نام مسیر؛ اگر در دیکشنری نبود، خود انگلیسی را نشان بده یا ID را کوتاه کن
          let label = routeLabels[segment] || segment;

          // اگر سگمنت شبیه UUID است، آن را کوتاه کن
          if (segment.length > 20 && !routeLabels[segment]) {
            label = `${segment.slice(0, 8)}...`;
          }

          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold text-gray-900">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={href}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="rtl:rotate-180" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
