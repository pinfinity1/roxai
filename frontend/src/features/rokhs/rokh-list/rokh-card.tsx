"use client";

import Link from "next/link";
import { MoreVertical, FileText, Loader2 } from "lucide-react";
import { ProjectResponse, ProjectStatus } from "@/lib/api/model"; //
import { Button } from "@/components/ui/button"; //
import { Card, CardContent } from "@/components/ui/card"; //
import { Badge } from "@/components/ui/badge"; //
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; //
import { cn, formatDate } from "@/lib/utils"; // formatDate که اضافه کردید

interface RokhCardProps {
  project: ProjectResponse;
}

export function RokhCard({ project }: RokhCardProps) {
  // تشخیص وضعیت‌ها
  const isGenerating = project.status === ProjectStatus.generating;
  const isFailed = project.status === ProjectStatus.failed;

  // رندر کردن بج وضعیت (فقط برای حالت‌های خاص)
  const renderStatus = () => {
    if (isGenerating) {
      return (
        <Badge variant="secondary" className="gap-1 animate-pulse">
          <Loader2 className="size-3 animate-spin" />
          در حال ساخت
        </Badge>
      );
    }
    if (isFailed) {
      return <Badge variant="destructive">خطا</Badge>;
    }
    return null;
  };

  // اگر در حال ساخته، کلیک روی کارت غیرفعال باشه
  const CardWrapper = isGenerating ? "div" : Link;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md border-border/50">
      {/* 1. بخش تصویر (Thumbnail) */}
      <CardWrapper
        href={`/editor/${project.id}`}
        className={cn(
          "block aspect-video w-full bg-muted/50 relative overflow-hidden",
          isGenerating && "cursor-not-allowed pointer-events-none",
        )}
      >
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // پلیس‌هولدر وقتی عکس نیست
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/20 text-muted-foreground/50">
            <FileText className="size-12 opacity-20" />
          </div>
        )}

        {/* وضعیت پروژه */}
        <div className="absolute top-2 right-2 z-10">{renderStatus()}</div>

        {/* افکت هاور */}
        {!isGenerating && (
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
        )}
      </CardWrapper>

      {/* 2. بخش پایین (عنوان و متادیتا) */}
      <CardContent className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <h3
              className="font-semibold leading-none tracking-tight truncate text-base"
              title={project.title}
            >
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {/* استفاده از تابع شما */}
              {project.updated_at ? formatDate(project.updated_at) : "نامشخص"}
            </p>
          </div>

          {/* منوی اکشن‌ها (فعلا فقط دکمه‌اش رو می‌ذاریم) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -me-2 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>ویرایش نام (به زودی)</DropdownMenuItem>
              <DropdownMenuItem disabled className="text-destructive">
                حذف (به زودی)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
