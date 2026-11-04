"use client";

import { cn } from "@/lib/utils";
import type { CoursePagination as PaginationType } from "@/lib/api/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type CoursePaginationProps = {
  pagination: PaginationType;
  /** Default: /course */
  basePath?: string;
};

export function CoursePagination({
  pagination,
  basePath = "/course",
}: CoursePaginationProps) {
  const searchParams = useSearchParams();
  const currentPage = pagination.page ?? 1;
  const totalPages = pagination.totalPages ?? 1;

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[10px] border border-stroke bg-white px-4 py-3 shadow-1 sm:px-6 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <p className="text-sm text-dark-4 dark:text-dark-6">
        Trang {currentPage} / {totalPages} — Tổng {pagination.total} khóa học
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={buildHref(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage <= 1}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            currentPage <= 1
              ? "pointer-events-none text-dark-4 opacity-50 dark:text-dark-6"
              : "text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3",
          )}
        >
          Trước
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              page === currentPage
                ? "bg-primary text-white"
                : "text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3",
            )}
          >
            {page}
          </Link>
        ))}

        <Link
          href={buildHref(Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage >= totalPages}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            currentPage >= totalPages
              ? "pointer-events-none text-dark-4 opacity-50 dark:text-dark-6"
              : "text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3",
          )}
        >
          Sau
        </Link>
      </div>
    </div>
  );
}
