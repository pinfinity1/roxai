"use client";

import { useState } from "react";
import { HomeHeader } from "./components/home-header";
import { HomeActions } from "./components/home-actions";
import { HomeFilters } from "./components/home-filters";
import { workspaceNavigation } from "@/features/workspace/sidebar/workspace-navigation";

type ViewType = "all" | "shared" | "trash" | "folder";

interface HomeViewProps {
  type: ViewType;
  folderId?: string;
  customTitle?: string;
}

const URL_MAPPING: Record<ViewType, string> = {
  all: "/",
  shared: "/shared-with-you",
  trash: "/trash",
  folder: "/folders",
};

export function HomeView({ type, folderId, customTitle }: HomeViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const homeItems =
    workspaceNavigation.mainNav.find((n) => n.title === "خانه")?.items || [];

  const targetUrl = URL_MAPPING[type];
  const configItem = homeItems.find((item) => item.url === targetUrl);

  const displayTitle = customTitle || configItem?.title || "پروژه‌ها";
  const Icon = configItem?.icon;
  const showActions = configItem?.showMainActions ?? false;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <HomeHeader
        title={displayTitle}
        icon={Icon ? <Icon className="size-5" /> : undefined}
      />

      {showActions && <HomeActions />}

      {type !== "trash" && (
        <HomeFilters
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          type={type}
        />
      )}
    </div>
  );
}
