export function getAccessTokenSubject(accessToken: string): string {
  try {
    const part = accessToken.split(".")[1];
    if (!part) return "";

    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));

    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(b64 + pad, "base64").toString("utf8")
        : atob(b64 + pad);

    const payload = JSON.parse(json) as Record<string, unknown>;
    const id =
      payload.sub ??
      payload.med_worker_id ??
      payload.user_id ??
      payload.doctor_id ??
      payload.id;

    return typeof id === "string" || typeof id === "number" ? String(id) : "";
  } catch {
    return "";
  }
}
