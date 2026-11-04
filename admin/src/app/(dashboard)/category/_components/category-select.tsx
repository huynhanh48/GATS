"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import type { CategoryType, CategoryWithCounts } from "@/lib/api/types";
import { fetchCategories } from "@/app/(dashboard)/category/actions";
import { cn } from "@/lib/utils";

type CategorySelectProps = {
  type: CategoryType;
  name?: string;
  label?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  className?: string;
  /** Preloaded list — skips client fetch when provided */
  options?: CategoryWithCounts[];
};

const selectClass =
  "w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark";

export function CategorySelect({
  type,
  name = "category_id",
  label = "Danh mục",
  defaultValue,
  disabled,
  className,
  options: initialOptions,
}: CategorySelectProps) {
  const [options, setOptions] = useState<CategoryWithCounts[]>(
    initialOptions ?? [],
  );
  const [loading, setLoading] = useState(!initialOptions);
  const [selectedValue, setSelectedValue] = useState(defaultValue ?? "");

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue ?? "");
    }
  }, [defaultValue]);

  useEffect(() => {
    if (initialOptions) {
      setOptions(initialOptions);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchCategories(type, "active")
      .then((data) => {
        if (!cancelled) setOptions(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type, initialOptions]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={name}>{label}</Label> : null}
      <select
        id={name}
        name={name}
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        disabled={disabled || loading}
        className={selectClass}
      >
        <option value="">
          {loading ? "Đang tải danh mục..." : "— Không chọn —"}
        </option>
        {options.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
