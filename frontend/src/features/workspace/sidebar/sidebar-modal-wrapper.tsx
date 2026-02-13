// frontend/src/features/workspace/sidebar/sidebar-action-wrapper.tsx
"use client";

import { GlobalSearchDialog } from "@/components/global/global-search";
// در آینده مودال‌های دیگر را اینجا ایمپورت کنید
// import { InviteDialog } from ...

interface SidebarModalWrapperProps {
  actionId?: string;
  children: React.ReactNode;
}

// 1. رجیستری مودال‌ها: اینجا مشخص می‌کنیم هر ID چه کامپوننتی را صدا می‌زند
const ACTION_REGISTRY: Record<
  string,
  React.ComponentType<{ children: React.ReactNode }>
> = {
  search: GlobalSearchDialog,
  // "invite": InviteDialog,  <-- مثال آینده
  // "settings": SettingsDialog, <-- مثال آینده
};

export function SidebarModalWrapper({
  actionId,
  children,
}: SidebarModalWrapperProps) {
  // اگر اکشن آی‌دی نداشتیم یا در رجیستری نبود، خود دکمه را بدون مودال برگردان
  if (!actionId || !ACTION_REGISTRY[actionId]) {
    return <>{children}</>;
  }

  const ModalComponent = ACTION_REGISTRY[actionId];

  // دکمه (children) را داخل مودال قرار می‌دهیم تا نقش Trigger را بازی کند
  return <ModalComponent>{children}</ModalComponent>;
}
