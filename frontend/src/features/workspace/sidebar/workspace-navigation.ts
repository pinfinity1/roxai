import {
  Home,
  LayoutTemplate,
  Library,
  Settings,
  MoreHorizontal,
  UserPlus,
  LifeBuoy,
  User,
  Palette,
  Type,
  Image as ImageIcon,
  LayoutGrid,
  Users,
  FolderOpen,
  Trash,
  FileText,
  Globe,
  Key,
  type LucideIcon,
  Search,
  Command,
  Sparkles,
  BadgeCheck,
  CreditCard,
  LogOut,
} from "lucide-react";

export interface NavItem {
  title: string;
  url?: string;
  icon?: any;
  isActive?: boolean;
  variant?: "link" | "modal" | "dropdown" | "separator";
  actionId?: string;
  items?: NavItem[];
  showMainActions?: boolean;
}

export interface WorkspaceConfig {
  mainNav: NavItem[];
  sidebarFooter: NavItem[];
}

export const workspaceNavigation: WorkspaceConfig = {
  mainNav: [
    {
      title: "خانه",
      url: "/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "همه رخ‌ها",
          url: "/",
          icon: LayoutGrid,
          variant: "link",
          showMainActions: true,
        },
        {
          title: "جستجو",
          icon: Search,
          variant: "modal",
          actionId: "search",
          showMainActions: true,
        },
        {
          title: "اشتراک‌گذاری شده با من",
          url: "/shared-with-you",
          icon: Users,
          variant: "link",
          showMainActions: false,
        },
        {
          title: "سطل زباله",
          url: "/trash",
          icon: Trash,
          variant: "link",
          showMainActions: false,
        },
      ],
    },
    {
      title: "قالب‌ها",
      url: "/templates",
      icon: LayoutTemplate,
    },
    {
      title: "کتابخانه",
      url: "/library",
      icon: Library,
      items: [
        {
          title: "تم‌ها",
          url: "/library?tab=themes",
          icon: Palette,
        },
        {
          title: "فونت‌ها",
          url: "/library?tab=fonts",
          icon: Type,
        },
        {
          title: "تصاویر هوش مصنوعی",
          url: "/library?tab=images",
          icon: ImageIcon,
        },
      ],
    },
    {
      title: "تنظیمات",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "نمای کلی",
          url: "/settings",
          icon: FileText,
        },
        {
          title: "اعضا",
          url: "/settings/members",
          icon: Users,
        },
        {
          title: "تنظیمات فضای کار",
          url: "/settings/defaults",
          icon: Globe,
        },
        {
          title: "کلیدهای API",
          url: "/settings/api",
          icon: Key,
        },
      ],
    },
    {
      title: "بیشتر",
      icon: MoreHorizontal,
      variant: "dropdown",
      items: [
        {
          title: "yechizi1",
          url: "/yechizi1",
          icon: FileText,
          variant: "link",
        },
        {
          title: "",
          variant: "separator",
        },
        {
          title: "yechizi2",
          icon: Command,
          variant: "modal",
          actionId: "shortcuts",
        },
      ],
    },
  ],
  sidebarFooter: [
    {
      title: "افزودن هم‌تیمی",
      url: "#invite",
      icon: UserPlus,
      variant: "modal",
      actionId: "invite",
    },
    {
      title: "پشتیبانی",
      url: "#support",
      icon: LifeBuoy,
      variant: "modal",
      actionId: "support",
    },
    {
      title: "حساب کاربری",
      url: "/account",
      icon: User,
      variant: "dropdown",
      items: [
        {
          title: "ارتقا به حرفه‌ای",
          icon: Sparkles,
          variant: "modal",
          actionId: "upgrade",
        },
        {
          title: "مدیریت حساب",
          url: "/settings/account",
          icon: BadgeCheck,
          variant: "link",
        },
        {
          title: "صورت‌حساب",
          url: "/settings/billing",
          icon: CreditCard,
          variant: "link",
        },
        {
          title: "خط جداکننده",
          variant: "separator",
        },
        {
          title: "خروج",
          icon: LogOut,
          variant: "modal",
          actionId: "logout",
        },
      ],
    },
  ],
};
