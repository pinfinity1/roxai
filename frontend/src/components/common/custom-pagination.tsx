"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function CustomPagination({
  page,
  totalPages,
  onChange,
  className,
}: CustomPaginationProps) {
  // اگر کلا ۱ صفحه داریم، چیزی رندر نکن
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  const handlePageChange = (newPage: number) => (e: React.MouseEvent) => {
    e.preventDefault(); // جلوگیری از رفرش لینک
    if (newPage >= 1 && newPage <= totalPages) {
      onChange(newPage);
    }
  };

  return (
    <div className={className}>
      <Pagination>
        <PaginationContent className="flex-row-reverse">
          {/* flex-row-reverse برای اینکه دکمه "بعدی" سمت چپ و "قبلی" سمت راست باشد (مثل استاندارد فارسی) */}

          {/* دکمه قبلی (سمت راست) */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePageChange(page - 1)}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* شماره‌ها */}
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={page === pageNum}
                  onClick={handlePageChange(Number(pageNum))}
                  className="cursor-pointer font-mono"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* دکمه بعدی (سمت چپ) */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handlePageChange(page + 1)}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// --- Logic Helper ---
function getPageNumbers(currentPage: number, totalPages: number) {
  // الگوریتم: همیشه اولی، آخری، و ۲ تا اطراف صفحه فعلی را نشان بده
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis-start");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis-end");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
