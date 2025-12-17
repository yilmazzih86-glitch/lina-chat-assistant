// components/Sidebar.tsx
"use client";

export type Mode = "prompt" | "chat" | "video";

export default function Sidebar({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <>
      <div className="brand">
        <div className="logo" />
        <div>
          <div className="brandTitle">Lina Asistan</div>
          <div className="brandSub">SpektrumCreative • Web Chat</div>
        </div>
      </div>

      <div className="nav">
        <button
          className={`navBtn ${mode === "chat" ? "navBtnActive" : ""}`}
          onClick={() => setMode("chat")}
        >
          <div className="navTitle">Chat</div>
          <div className="navDesc">Genel soru/cevap</div>
        </button>

        <button
          className={`navBtn ${mode === "prompt" ? "navBtnActive" : ""}`}
          onClick={() => setMode("prompt")}
        >
          <div className="navTitle">Prompt</div>
          <div className="navDesc">Veo / Banana / Sora prompt üret</div>
        </button>
      </div>

      
    </>
  );
}

function WebhookInput() {
  const key = "lina_webhook_url";
  const envDefault = process.env.NEXT_PUBLIC_LINA_WEBHOOK_URL || "";
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(key) : "";
    setValue(saved || envDefault);
  }, [envDefault]);

  function onChange(v: string) {
    setValue(v);
    if (typeof window !== "undefined") localStorage.setItem(key, v);
  }

  return (
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://.../webhook/lina/chat"
    />
  );
}

import React from "react";
