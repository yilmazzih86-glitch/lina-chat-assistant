"use client";

import React from "react";
import { LinaMode } from "@/lib/linaClient";
import { useLinaChat } from "@/lib/useLinaChat";

export default function ChatLikePanel({ mode }: { mode: LinaMode }) {
  const { messages, loading, send, clear } = useLinaChat(mode);
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
      setInput("");
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="chips">
          <span className="chip">
            Mod: <b>{mode}</b>
          </span>
          <span className="chip">
            Durum: <b>prompt lab</b>
          </span>
        </div>

        <div className="panelActions">
          <button className="btn btnGhost" onClick={clear} type="button">
            Temizle
          </button>
        </div>
      </div>

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role === "user" ? "msgUser" : "msgAssistant"}`}>
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
          placeholder={mode === "prompt" ? "Prompt isteğini yaz…" : "Lina’ya sor…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
        />

        <button
          className="btn btnPrimary"
          onClick={() => {
            void send(input);
            setInput("");
          }}
          disabled={loading || !input.trim()}
          type="button"
        >
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>
      </div>
    </div>
  );
}
