"use client";

import { TagSelect } from "@/components/tags/tag-select";
import type { TagPublic } from "@/lib/api/types";

type PostTagSelectProps = {
  defaultValue?: TagPublic[];
  disabled?: boolean;
};

/** @deprecated Prefer TagSelect type="post" */
export function PostTagSelect(props: PostTagSelectProps) {
  return <TagSelect type="post" {...props} />;
}
