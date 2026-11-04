"use server";
import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type AiToolConfig = {
  id: string; type: "prompt" | "api_provider" | "skill" | "mcp" | "tool" | "stem"; itemKey: string; title: string;
  isPublic: boolean; isPaid: boolean; websiteUrl: string | null; payload: Record<string, unknown> | null;
};
export async function fetchAiToolConfigs(type: AiToolConfig["type"]) {
  const result = await beFetch<{ data: AiToolConfig[] }>(`/ai-tools-config/admin?type=${type}&take=100`);
  return result.ok ? result.data?.data ?? [] : [];
}
export async function updateAiToolConfig(type: AiToolConfig["type"], itemKey: string, input: Partial<Pick<AiToolConfig,"title"|"isPublic"|"isPaid"|"websiteUrl"|"payload">>) {
  const endpoint = type === "api_provider" ? "api" : type;
  const method = type === "prompt" ? "PATCH" : "POST";
  const path = type === "prompt" ? `/ai-tools-config/prompt/${itemKey}` : `/ai-tools-config/${endpoint}`;
  const body = type === "prompt" ? input : { itemKey, ...input };
  const result = await beFetch(path, { method, body: JSON.stringify(body) });
  if (!result.ok) return { ok: false, message: result.error ?? "Cập nhật thất bại" };
  const listPath = type === "prompt" ? "/ai-tools/prompts" : type === "skill" ? "/ai-tools/skills" : type === "mcp" ? "/ai-tools/mcps" : type === "tool" ? "/ai-tools/tools" : type === "stem" ? "/ai-tools/stem" : "/ai-tools/api-providers";
  revalidatePath(listPath);
  if (type === "prompt") revalidatePath(`/ai-tools/prompts/${itemKey}/edit`);
  if (type === "api_provider") revalidatePath(`/ai-tools/api-providers/${itemKey}/edit`);
  if (type === "skill") revalidatePath(`/ai-tools/skills/${itemKey}/edit`);
  if (type === "mcp") revalidatePath(`/ai-tools/mcps/${itemKey}/edit`);
  if (type === "tool") revalidatePath(`/ai-tools/tools/${itemKey}/edit`);
  if (type === "stem") revalidatePath(`/ai-tools/stem/${itemKey}/edit`);
  return { ok: true, message: "Đã lưu thay đổi" };
}
export async function createPrompt(input: Omit<AiToolConfig,"id"|"type"|"websiteUrl">) {
  const result=await beFetch("/ai-tools-config/prompt",{method:"POST",body:JSON.stringify(input)});
  if(!result.ok)return {ok:false,message:result.error??"Tạo prompt thất bại"};
  revalidatePath("/ai-tools/prompts"); return {ok:true,message:"Đã tạo prompt mới"};
}
export async function createApiModel(input: Omit<AiToolConfig,"id"|"type">) {
  const result=await beFetch("/ai-tools-config/api-model",{method:"POST",body:JSON.stringify(input)});
  if(!result.ok)return {ok:false,message:result.error??"Tạo API Model thất bại"};
  revalidatePath("/ai-tools/api-providers"); return {ok:true,message:"Đã tạo API Provider mới"};
}
export type ApiModelSyncSummary = {
  totalFetched: number;
  freeFound: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  hiddenCount: number;
  failedCount: number;
  skippedLocked: boolean;
  durationMs: number;
};
export async function syncFreeApiModelsAction() {
  const result = await beFetch<{ message: string; summary: ApiModelSyncSummary }>(
    "/ai-tools-config/api-model/sync-free",
    { method: "POST" },
  );
  if (!result.ok || !result.data?.summary) {
    return { ok: false as const, message: result.error ?? "Đồng bộ API Model thất bại" };
  }
  revalidatePath("/ai-tools/api-models");
  return { ok: true as const, message: result.data.message, summary: result.data.summary };
}
export async function bulkDeleteApiProviders(itemKeys: string[]) {
  const result = await beFetch<{ deletedCount: number }>("/ai-tools-config/api-provider/bulk-delete", { method: "POST", body: JSON.stringify({ itemKeys }) });
  if (!result.ok) return { ok: false as const, message: result.error ?? "Xóa API Provider thất bại" };
  revalidatePath("/ai-tools/api-providers");
  revalidatePath("/ai-tools/api-models");
  return { ok: true as const, deletedCount: result.data?.deletedCount ?? 0 };
}
export async function bulkDeleteApiModels(models: Array<{ providerKey: string; modelId: string }>) {
  const result = await beFetch<{ deletedCount: number }>("/ai-tools-config/api-model/bulk-delete", { method: "POST", body: JSON.stringify({ models }) });
  if (!result.ok) return { ok: false as const, message: result.error ?? "Xóa API Model thất bại" };
  revalidatePath("/ai-tools/api-providers");
  revalidatePath("/ai-tools/api-models");
  return { ok: true as const, deletedCount: result.data?.deletedCount ?? 0 };
}
export async function upsertApiModel(input: { providerKey: string; id: string; isActive: boolean }) {
  const result = await beFetch("/ai-tools-config/api-model/upsert", { method: "POST", body: JSON.stringify(input) });
  if (!result.ok) return { ok: false as const, message: result.error ?? "Lưu API Model thất bại" };
  revalidatePath("/ai-tools/api-providers");
  revalidatePath("/ai-tools/api-models");
  return { ok: true as const };
}
export async function createSkill(input: Omit<AiToolConfig,"id"|"type"|"websiteUrl">) {
  const result=await beFetch("/ai-tools-config/skill",{method:"POST",body:JSON.stringify(input)});
  if(!result.ok)return {ok:false,message:result.error??"Tạo Skill thất bại"};
  revalidatePath("/ai-tools/skills"); return {ok:true,message:"Đã tạo Skill mới"};
}
export async function createAiResource(type: "mcp" | "tool" | "stem", input: Omit<AiToolConfig,"id"|"type">) {
  const result = await beFetch(`/ai-tools-config/${type}`, { method: "POST", body: JSON.stringify(input) });
  if (!result.ok) return { ok: false, message: result.error ?? `Tạo ${type.toUpperCase()} thất bại` };
  revalidatePath(`/ai-tools/${type === "mcp" ? "mcps" : type === "tool" ? "tools" : "stem"}`);
  return { ok: true, message: `Đã tạo ${type === "mcp" ? "MCP" : type === "tool" ? "Tool" : "STEM"} mới` };
}
export async function bulkDeleteAiTools(type: "prompt" | "skill" | "mcp" | "tool" | "stem", itemKeys: string[]) {
  const result = await beFetch<{ deletedCount: number }>("/ai-tools-config/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ type, itemKeys }),
  });
  if (!result.ok) return { ok: false as const, message: result.error ?? "Xóa nội dung thất bại" };
  const listPath = type === "prompt" ? "/ai-tools/prompts" : type === "skill" ? "/ai-tools/skills" : type === "mcp" ? "/ai-tools/mcps" : type === "tool" ? "/ai-tools/tools" : "/ai-tools/stem";
  revalidatePath(listPath);
  return { ok: true as const, deletedCount: result.data?.deletedCount ?? 0 };
}
export async function deletePrompt(itemKey:string){
  const result=await beFetch(`/ai-tools-config/prompt/${itemKey}`,{method:"DELETE"});
  if(!result.ok)return {ok:false,message:result.error??"Xóa prompt thất bại"};
  revalidatePath("/ai-tools/prompts"); return {ok:true,message:"Đã xóa prompt"};
}
