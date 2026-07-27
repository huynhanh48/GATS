"use server";

import { createTag, fetchTags } from "@/components/tags/tag-actions";
import type { TagWithCounts } from "@/lib/api/types";

export async function fetchCourseTags(): Promise<TagWithCounts[]> {
  return fetchTags("course");
}

export async function createCourseTag(
  name: string,
): Promise<{ ok: boolean; message: string; tag?: TagWithCounts }> {
  return createTag(name, "course");
}
