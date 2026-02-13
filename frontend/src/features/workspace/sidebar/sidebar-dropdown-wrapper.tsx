"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { NavItem } from "./workspace-navigation";
import { SidebarModalWrapper } from "./sidebar-modal-wrapper"; // برای آیتم‌هایی که داخل دراپ‌داون مودال باز می‌کنند

interface SidebarDropdownWrapperProps {
  item: NavItem;
  children: React.ReactNode; // دکمه تریگر (مثلاً دکمه "بیشتر")
}

export function SidebarDropdownWrapper({
  item,
  children,
}: SidebarDropdownWrapperProps) {
  if (!item.items || item.items.length === 0) return <>{children}</>;

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56" side="left">
        {item.items.map((subItem, index) => {
          if (subItem.variant === "separator")
            return <DropdownMenuSeparator key={index} />;

          const Content = (
            <div className="flex items-center cursor-pointer">
              {subItem.icon && <subItem.icon className="ml-2 size-4" />}
              <span>{subItem.title}</span>
            </div>
          );

          // حالت ۱: لینک معمولی
          if (subItem.variant === "link" && subItem.url) {
            return (
              <DropdownMenuItem key={subItem.title} asChild>
                <Link href={subItem.url}>{Content}</Link>
              </DropdownMenuItem>
            );
          }

          // حالت ۲: مودال (مثلاً شورت‌کات‌ها)
          if (subItem.variant === "modal" && subItem.actionId) {
            return (
              <SidebarModalWrapper
                key={subItem.title}
                actionId={subItem.actionId}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {Content}
                </DropdownMenuItem>
              </SidebarModalWrapper>
            );
          }

          // حالت پیش‌فرض (فقط دکمه)
          return (
            <DropdownMenuItem key={subItem.title}>{Content}</DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
