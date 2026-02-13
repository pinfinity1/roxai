// frontend/src/features/workspace/sidebar/main-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { workspaceNavigation, NavItem } from "./workspace-navigation"; // NavItem رو هم ایمپورت کن
import { SidebarFooterCommon } from "./sidebar-footer";
import { SidebarDropdownWrapper } from "./sidebar-dropdown-wrapper";

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isNavActive = (item: NavItem) => {
    if (item.url) {
      if (item.url === "/" && pathname === "/") return true;

      if (item.url !== "/" && pathname.startsWith(item.url)) return true;
    }

    if (item.items) {
      return item.items.some((child) => {
        if (!child.url) return false;

        if (child.url === "/") {
          return pathname === "/";
        }

        return pathname.startsWith(child.url);
      });
    }

    return false;
  };

  // پیدا کردن آیتم فعال برای نمایش ساب‌منو در موبایل
  const activeNavItem = workspaceNavigation.mainNav.find((item) =>
    isNavActive(item),
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card z-20 lg:!w-[--sidebar-width]"
      {...props}
    >
      <SidebarHeader className="py-4 justify-center items-center">
        <Link href="/">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm hover:bg-primary/20 transition-colors">
            <Image
              src="/icon0.svg"
              alt="Roxai"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <div className="flex flex-col gap-2 items-start px-2 lg:items-center lg:px-0">
          {workspaceNavigation.mainNav.map((item) => {
            const active = isNavActive(item);

            const buttonClass = cn(
              "flex items-center gap-3 rounded-xl transition-all cursor-pointer",
              "w-full justify-start h-10 px-3",
              "lg:flex-col lg:justify-center lg:h-auto lg:py-2 lg:w-14",
              active
                ? "bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            );

            if (item.variant === "dropdown") {
              return (
                <SidebarMenuItem
                  key={item.title}
                  className="list-none w-full lg:w-auto"
                >
                  <SidebarDropdownWrapper item={item}>
                    <SidebarMenuButton
                      tooltip={mounted && !isMobile ? item.title : undefined}
                      isActive={active}
                      className={buttonClass}
                    >
                      <item.icon className="!size-5" />
                      <span className="font-medium text-sm lg:text-[9px]">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarDropdownWrapper>
                </SidebarMenuItem>
              );
            }

            const href = item.url ?? "#";
            return (
              <SidebarMenuItem
                key={item.title}
                className="list-none w-full lg:w-auto"
              >
                <SidebarMenuButton
                  asChild
                  tooltip={mounted && !isMobile ? item.title : undefined}
                  isActive={active}
                  className={buttonClass}
                >
                  <Link href={href}>
                    <item.icon className="!size-5" />
                    <span className="font-medium text-sm lg:text-[9px]">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </div>

        {mounted && isMobile && activeNavItem?.items && (
          <div className="mt-6 px-2 animate-in slide-in-from-left-2">
            <div className="text-xs font-semibold text-muted-foreground/50 mb-2 px-2 uppercase tracking-wider border-b pb-1">
              {activeNavItem.title}
            </div>
            <div className="space-y-1 mt-2">
              {activeNavItem.items.map((subItem) => {
                const subHref = subItem.url ?? "#";
                const isSubActive =
                  subItem.url && pathname.startsWith(subItem.url);

                return (
                  <Link key={subItem.title} href={subHref} className="block">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 px-3 font-normal text-muted-foreground hover:text-foreground",
                        isSubActive &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                      )}
                    >
                      {subItem.icon && <subItem.icon className="size-4" />}
                      <span className="text-sm">{subItem.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooterCommon />
    </Sidebar>
  );
}
