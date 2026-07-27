"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { TagPublic, TagWithCounts } from "@/lib/api/types";
import { createTag, fetchTags } from "./tag-actions";

type TagSelectProps = {
  type: "course" | "post";
  defaultValue?: TagPublic[];
  disabled?: boolean;
};

function toTagOption(
  tag: TagPublic,
  type: "course" | "post",
): TagWithCounts {
  return {
    ...tag,
    type: tag.type === "global" ? "global" : type,
    status: "active",
    courseCount: 0,
    postCount: 0,
  };
}

export function TagSelect({
  type,
  defaultValue = [],
  disabled,
}: TagSelectProps) {
  const anchor = useComboboxAnchor();
  const [options, setOptions] = useState<TagWithCounts[]>(
    defaultValue.map((tag) => toTagOption(tag, type)),
  );
  const [selected, setSelected] = useState<TagWithCounts[]>(
    defaultValue.map((tag) => toTagOption(tag, type)),
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTags(type)
      .then((tags) => {
        if (cancelled) return;
        setOptions((current) => {
          const byId = new Map(current.map((tag) => [tag.id, tag]));
          for (const tag of tags) byId.set(tag.id, tag);
          return [...byId.values()];
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const exactMatch = options.some(
    (tag) =>
      tag.name.toLocaleLowerCase("vi") === normalizedQuery ||
      tag.slug.toLocaleLowerCase("vi") === normalizedQuery,
  );

  async function handleCreate() {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    const result = await createTag(name, type);
    setCreating(false);
    if (!result.ok || !result.tag) {
      toast.error(result.message);
      return;
    }
    setOptions((current) => [...current, result.tag!]);
    setSelected((current) => [...current, result.tag!]);
    setQuery("");
    toast.success(result.message);
  }

  return (
    <div className="space-y-2">
      <label className="block font-medium text-dark dark:text-white">
        Tags
      </label>
      <input
        type="hidden"
        name="tag_ids"
        value={JSON.stringify(selected.map((tag) => tag.id))}
      />
      <Combobox
        multiple
        items={options}
        value={selected}
        onValueChange={(value) => setSelected(value as TagWithCounts[])}
        itemToStringLabel={(tag: TagWithCounts) => tag.name}
        isItemEqualToValue={(a: TagWithCounts, b: TagWithCounts) =>
          a.id === b.id
        }
        disabled={disabled || loading}
      >
        <ComboboxChips
          ref={anchor}
          className="min-h-11 rounded-lg border-[1.5px] border-stroke bg-transparent px-3 dark:border-dark-3 dark:bg-dark-2"
        >
          {selected.map((tag) => (
            <ComboboxChip key={tag.id}>{tag.name}</ComboboxChip>
          ))}
          <ComboboxChipsInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={loading ? "Đang tải tags..." : "Tìm hoặc tạo tag..."}
            disabled={disabled || loading}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            <div className="space-y-2 px-3 py-2">
              <p>Không tìm thấy tag phù hợp.</p>
              {query.trim() && !exactMatch ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 font-medium text-white disabled:opacity-60"
                >
                  <PlusIcon className="size-4" />
                  {creating ? "Đang tạo..." : `Tạo tag “${query.trim()}”`}
                </button>
              ) : null}
            </div>
          </ComboboxEmpty>
          <ComboboxList>
            {(tag: TagWithCounts) => (
              <ComboboxItem key={tag.id} value={tag}>
                <span>{tag.name}</span>
                {tag.type === "global" ? (
                  <span className="text-xs text-muted-foreground">
                    Toàn hệ thống
                  </span>
                ) : null}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-sm text-dark-4 dark:text-dark-6">
        Chọn nhiều tag. Nếu chưa có tag phù hợp, nhập tên để tạo mới.
      </p>
    </div>
  );
}
