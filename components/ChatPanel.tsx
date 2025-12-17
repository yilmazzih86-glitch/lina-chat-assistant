"use client";

import React from "react";

type LinaMode = "chat" | "prompt" | "video";

type LinaResponse = {
  reply?: string;
  sessionId?: string;
  mode?: LinaMode;
  meta?: any;
};

type Msg = {
  role: "user" | "assistant";
  text: string;
};

function getWebhookUrl(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_LINA_WEBHOOK_URL || "";
  const saved = window.localStorage.getItem("lina_webhook_url");
  return saved || process.env.NEXT_PUBLIC_LINA_WEBHOOK_URL || "";
}

function getSessionId(): string {
  if (typeof window === "undefined") return "sess_server";
  const key = "lina_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `sess_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  window.localStorage.setItem(key, created);
  return created;
}

async function callLina(payload: any): Promise<LinaResponse> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) throw new Error("Webhook URL yok. .env.local veya localStorage ile ayarla.");

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

export default function ChatPanel() {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", text: "Merhaba! Ben Lina. Sorunu yaz, birlikte netleştirelim." },
  ]);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const sessionId = getSessionId();

      const data = await callLina({
        message: text,
        sessionId,
        mode: "chat" as LinaMode,
        meta: { target: "prompt_lab" },
      });

      const reply = (data?.reply || "").trim() || "Cevap boş döndü.";
      if (data?.sessionId && typeof window !== "undefined") {
        window.localStorage.setItem("lina_session_id", data.sessionId);
      }

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Bir hata oldu: ${e?.message || String(e)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="chips">
          <span className="chip">Mod: <b>chat</b></span>
          <span className="chip">Durum: <b>prompt lab</b></span>
        </div>
      </div>

      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role === "user" ? "msgUser" : "msgAssistant"}`}>
            <div className="msgBubble">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg msgAssistant">
            <div className="msgBubble subtle">Yazıyor…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <textarea
          className="textarea"
          placeholder="Lina’ya sor…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
        />
        <button className="btn btnPrimary" onClick={() => void send()} disabled={loading}>
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>
      </div>
    </div>
  );
}
