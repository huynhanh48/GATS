"use client";

import { TagSelect } from "@/components/tags/tag-select";
import type { TagPublic } from "@/lib/api/types";

type CourseTagSelectProps = {
  defaultValue?: TagPublic[];
  disabled?: boolean;
};

/** @deprecated Prefer TagSelect type="course" */
export function CourseTagSelect(props: CourseTagSelectProps) {
  return <TagSelect type="course" {...props} />;
}
