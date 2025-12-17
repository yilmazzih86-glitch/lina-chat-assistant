"use client";

import React from "react";

type LinaMode = "chat" | "prompt" | "video";

type LinaResponse = {
  reply?: string;
  sessionId?: string;
  mode?: LinaMode;
  meta?: any;
};

type Props = {
  goPrompt?: () => void; // Shell.tsx: <VideoPanel goPrompt={() => setMode("prompt")} />
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

function buildVideoRequest(params: { audience: string; tone: string; topic: string }) {
  const { audience, tone, topic } = params;

  return [
    "Aşağıdaki konu için Lina knowledge’dan araştırıp 30 saniyelik Reels bilgi senaryosu yaz.",
    "",
    `Hedef Kitle: ${audience}`,
    `Amaç/Ton: ${tone}`,
    `Konu: ${topic}`,
    "",
    "FORMAT (KISA ve NET):",
    "- Hook (0–3 sn)",
    "- Body (3–22 sn) (maks 3 madde, basit cümleler)",
    "- Mikro örnek (1 cümle)",
    "- Kapanış (22–30 sn) (soft CTA)",
    "",
    "SONRA AYNI METİNDEN ŞU ÇIKTILARI ÜRET (AYRI BAŞLIKLARLA):",
    "1) Banana Pro için (tek kadın, IG feed uygun) görsel prompt + negatif prompt",
    "2) Veo 3 için 10–30 sn video promptu (kamera hareketleri + hook + ritim) ",
    "Not: Lina görsel referansını BEN ekleyeceğim. Sen sadece metinsel prompt üret.",
  ].join("\n");
}

export default function VideoPanel({ goPrompt }: Props) {
  const [audience, setAudience] = React.useState("Türkiye'de emlakla ilgilenen genel izleyici");
  const [tone, setTone] = React.useState("30 saniyelik bilgi videosu (satış yok, net bilgi, güven veren ton)");
  const [topic, setTopic] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const outputRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    outputRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output, loading]);

  async function run() {
    const t = topic.trim();
    if (!t || loading) return;

    setLoading(true);
    setCopied(false);

    try {
      const sessionId = getSessionId();
      const message = buildVideoRequest({ audience, tone, topic: t });

      const data = await callLina({
        message,
        sessionId,
        mode: "video" as LinaMode,
        meta: { target: "prompt_lab", audience, tone },
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

  function clear() {
    setTopic("");
    setOutput("");
    setCopied(false);
  }

  function pushToPrompt() {
    const text = output?.trim();
    if (!text) return;

    window.localStorage.setItem("lina_prompt_draft", text);
    window.dispatchEvent(new Event("lina_prompt_draft"));
    goPrompt?.();
  }

  function onKeyDownTopic(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void run();
    }
  }

  return (
    <div className="panel">
      <div className="hero">
        <div className="heroTop">
          <div className="heroTitle">
            <span className="heroIcon" aria-hidden />
            <div>
              <div className="h1">30 Saniyelik Bilgi Videosu</div>
              <div className="sub">
                Konu gir → Lina knowledge’dan araştır → senaryo üret → Prompt’a aktar
              </div>
            </div>
          </div>

          <div className="chips">
            <span className="chip">Mod: <b>video</b></span>
            <span className="chip">Durum: <b>prompt lab</b></span>
          </div>
        </div>

        <div className="card cardInset">
          <div className="grid2">
            <div className="field">
              <label className="label">Hedef Kitle</label>
              <input className="input" value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>

            <div className="field">
              <label className="label">Amaç / Ton</label>
              <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Konu</label>
            <textarea
              className="textarea"
              placeholder="Örn: Tapu masraflarını kim öder?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={onKeyDownTopic}
              rows={4}
            />
            <div className="hintRow">
              <span className="hint">Enter: üret • Shift+Enter: alt satır</span>
              <button className="btn btnGhost" onClick={clear} disabled={loading && !output}>
                Temizle
              </button>
            </div>
          </div>

          <div className="btnRow">
            <button className="btn btnPrimary" onClick={() => void run()} disabled={loading || !topic.trim()}>
              {loading ? "Üretiliyor…" : "Üret"}
            </button>

            <button className="btn btnSecondary" onClick={() => void copy()} disabled={!output}>
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>

            <button className="btn btnAccent" onClick={pushToPrompt} disabled={!output}>
              Prompt’a Aktar →
            </button>
          </div>
        </div>

        <div className="card">
          <div className="cardTop">
            <div className="cardTitle">Üretilen Senaryo</div>
            <span className={`badge ${output ? "badgeReady" : ""}`}>{output ? "Hazır" : "—"}</span>
          </div>

          <pre className="outputBox">
            {output || "Henüz çıktı yok. Konu girip Üret’e bas."}
            <div ref={outputRef} />
          </pre>
        </div>
      </div>
    </div>
  );
}
