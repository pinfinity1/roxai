// frontend/src/features/workspace/sidebar/context-sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import { HomeContextContent } from "./home-content";
import { useSidebar } from "@/components/ui/sidebar";
// ایمپورت سایر کانتنت‌ها...

export function WorkspaceContextSidebar() {
  const pathname = usePathname();
  const context = getContextFromPath(pathname);
  const { isMobile } = useSidebar();

  if (isMobile) return null;

  // متغیر محتوا را بر اساس کانتکست انتخاب می‌کنیم
  let content = null;

  switch (context) {
    case "home":
      content = <HomeContextContent />;
      break;

    // case "library":
    //   content = <LibraryContent />;
    //   break;

    // case "settings":
    //   content = <SettingsContent />;
    //   break;

    default:
      content = null;
  }

  // اگر محتوایی نبود، هیچی رندر نکن
  if (!content) return null;

  // ✅ این div همان جایی است که خط (border-l) و عرض (w-[260px]) را تنظیم می‌کند
  return (
    <div className="hidden lg:flex w-[260px] flex-col border-l border-border bg-background/50 backdrop-blur-md h-screen shrink-0 sticky top-0">
      {content}
    </div>
  );
}

function getContextFromPath(path: string) {
  if (!path) return "home";
  if (path.startsWith("/library")) return "library";
  if (path.startsWith("/settings")) return "settings";
  if (path.startsWith("/templates")) return "templates";
  return "home";
}
