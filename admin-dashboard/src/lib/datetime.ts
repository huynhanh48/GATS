const VN_TZ = "Asia/Ho_Chi_Minh";

/** Format ISO timestamps in Vietnam time (avoids UTC on Docker/SSR). */
export function formatVnDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      timeZone: VN_TZ,
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}
