"use client";

import * as React from "react";
import { callLina, getOrCreateSessionId, LinaMode } from "./linaClient";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

function uid() {
  return `m_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export function useLinaChat(mode: LinaMode) {
  const [messages, setMessages] = React.useState<ChatMsg[]>([
    {
      id: uid(),
      role: "assistant",
      text: mode === "prompt"
        ? "Prompt modundasın. İsteğini yaz, ben çıktı üreteyim."
        : "Merhaba! Ben Lina. Sorunu yaz, birlikte netleştirelim.",
      createdAt: Date.now(),
    },
  ]);

  const [loading, setLoading] = React.useState(false);

  const send = React.useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || loading) return;

      const userMsg: ChatMsg = { id: uid(), role: "user", text: message, createdAt: Date.now() };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);

      try {
        const sessionId = getOrCreateSessionId();

        const data = await callLina({
          message,
          sessionId,
          mode,
          meta: { target: "prompt_lab" },
        });

        if (data?.sessionId && typeof window !== "undefined") {
          window.localStorage.setItem("lina_session_id", data.sessionId);
        }

        const reply = (data?.reply || "").trim() || "Cevap boş döndü.";
        const botMsg: ChatMsg = { id: uid(), role: "assistant", text: reply, createdAt: Date.now() };
        setMessages((m) => [...m, botMsg]);
      } catch (e: any) {
        const botMsg: ChatMsg = {
          id: uid(),
          role: "assistant",
          text: `Bir hata oldu: ${e?.message || String(e)}`,
          createdAt: Date.now(),
        };
        setMessages((m) => [...m, botMsg]);
      } finally {
        setLoading(false);
      }
    },
    [mode, loading]
  );

  const clear = React.useCallback(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        text: mode === "prompt"
          ? "Prompt modundasın. İsteğini yaz, ben çıktı üreteyim."
          : "Merhaba! Ben Lina. Sorunu yaz, birlikte netleştirelim.",
        createdAt: Date.now(),
      },
    ]);
  }, [mode]);

  return { messages, loading, send, clear };
}
