"use client";

import React from "react";

type LinaMode = "chat" | "prompt" | "video";

type LinaResponse = {
  reply?: string;
  sessionId?: string;
  mode?: LinaMode;
  meta?: any;
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

export default function PromptPanel() {
  const [input, setInput] = React.useState(
    "Buradan prompt isteği gönder. Örn: “Veo için 10 sn tanıtım promptu yaz…”"
  );
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  // VideoPanel -> Prompt'a aktar (draft sync)
  React.useEffect(() => {
    function pullDraft() {
      const draft = window.localStorage.getItem("lina_prompt_draft");
      if (draft && draft.trim()) setInput(draft);
    }

    pullDraft();
    window.addEventListener("lina_prompt_draft", pullDraft);

    return () => window.removeEventListener("lina_prompt_draft", pullDraft);
  }, []);

  // Output auto-scroll
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output, loading]);

  async function run() {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setCopied(false);

    try {
      const sessionId = getSessionId();
      const data = await callLina({
        message: text,
        sessionId,
        mode: "prompt" as LinaMode,
        meta: { target: "prompt_lab" },
      });

      const reply = (data?.reply || "").trim() || "Cevap boş döndü.";
      if (data?.sessionId) window.localStorage.setItem("lina_session_id", data.sessionId);

      setOutput(reply);
    } catch (e: any) {
      setOutput(`Bir hata oldu: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void run();
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="chips">
          <span className="chip">Mod: <b>prompt</b></span>
          <span className="chip">Durum: <b>prompt lab</b></span>
        </div>

        <div className="panelActions">
          <button className="btn btnGhost" onClick={() => void copy()} disabled={!output}>
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <label className="label">İstediğin prompt çıktısını tarif et</label>
          <textarea
            className="textarea textareaTall"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={8}
          />
          <div className="hintRow">
            <span className="hint">Enter: üret • Shift+Enter: alt satır</span>
            <button className="btn btnPrimary" onClick={() => void run()} disabled={loading}>
              {loading ? "Üretiliyor…" : "Üret"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="cardTop">
            <div className="cardTitle">Çıktı</div>
            <span className={`badge ${output ? "badgeReady" : ""}`}>{output ? "Hazır" : "—"}</span>
          </div>

          <pre className="outputBox">
            {output || "Henüz çıktı yok. Yukarıdan isteğini yazıp Üret’e bas."}
            <div ref={bottomRef} />
          </pre>
        </div>
      </div>
    </div>
  );
}
