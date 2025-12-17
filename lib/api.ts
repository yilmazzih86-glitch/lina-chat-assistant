// lib/api.ts
export type LinaMode = "chat" | "prompt" | "video";

export async function sendToLina(params: {
  webhookUrl: string;
  message: string;
  sessionId: string;
  mode: LinaMode;
  meta?: Record<string, any>;
}) {
  const res = await fetch(params.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      sessionId: params.sessionId,
      mode: params.mode,
      meta: params.meta ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Webhook error (${res.status}): ${text || "No body"}`);
  }

  const data = await res.json();
  // n8n Format Response -> reply alanını dönüyor :contentReference[oaicite:2]{index=2}
  const reply =
    (Array.isArray(data) ? data[0]?.reply : data?.reply) ??
    (Array.isArray(data) ? data[0] : data);

  return String(reply ?? "");
}
