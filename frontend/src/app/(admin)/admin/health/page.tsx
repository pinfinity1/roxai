import { Metadata } from "next";
import { HealthDashboardView } from "@/features/admin/components/health/health-dashboard-view";

export const metadata: Metadata = {
  title: "سلامت سیستم | پنل مدیریت",
  description: "مانیتورینگ وضعیت سرور و دیتابیس",
};

export default function SystemHealthPage() {
  return <HealthDashboardView />;
}
