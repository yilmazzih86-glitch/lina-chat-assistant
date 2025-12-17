export type LinaMode = "chat" | "prompt";

export type LinaResponse = {
  reply?: string;
  sessionId?: string;
  mode?: LinaMode;
  meta?: any;
};

export function getWebhookUrl(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_LINA_WEBHOOK_URL || "";
  const saved = window.localStorage.getItem("lina_webhook_url");
  return saved || process.env.NEXT_PUBLIC_LINA_WEBHOOK_URL || "";
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "sess_server";
  const key = "lina_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created = `sess_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  window.localStorage.setItem(key, created);
  return created;
}

export async function callLina(payload: {
  message: string;
  mode: LinaMode;
  sessionId: string;
  meta?: Record<string, any>;
}): Promise<LinaResponse> {
  const webhookUrl = getWebhookUrl();

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Webhook hata: ${res.status} ${res.statusText} ${txt}`);
  }

  return (await res.json()) as LinaResponse;
}
