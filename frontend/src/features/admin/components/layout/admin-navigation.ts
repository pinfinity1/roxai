import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Flag,
  Activity,
  CreditCard,
  Settings,
  ShieldAlert,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  disabled?: boolean;
  variant?: "default" | "ghost"; // برای تمایز آیتم‌های خاص
}

export const adminSidebarItems: NavItem[] = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "مدیریت کاربران",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "پروژه‌ها",
    href: "/admin/projects",
    icon: FolderOpen,
    disabled: true,
  },
  {
    title: "ویژگی‌ها (Feature Flags)",
    href: "/admin/features",
    icon: Flag,
    disabled: true,
  },
  {
    title: "امور مالی",
    href: "/admin/billing",
    icon: CreditCard,
    disabled: true,
  },
  {
    title: "سلامت سیستم",
    href: "/admin/health",
    icon: Activity,
  },
];

export const adminBottomItems: NavItem[] = [
  {
    title: "تنظیمات سیستم",
    href: "/admin/settings",
    icon: Settings,
    disabled: true,
  },
];
