// components/Shell.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { Mode } from "./Sidebar";
import ChatPanel from "./ChatPanel";
import PromptPanel from "./PromptPanel";
import VideoPanel from "./VideoPanel";

export default function Shell() {
  const [mode, setMode] = React.useState<Mode>("prompt");

  return (
    <div className="container">
      <div className="card sidebar">
        <Sidebar mode={mode} setMode={setMode} />
      </div>

      <div className="card main">
        <div className="topbar">
          <div className="pillRow">
            <span className="pill">
              Mod: <b>{mode}</b>
            </span>
            <span className="pill">
              Durum: <b>prompt lab</b>
            </span>
          </div>
          <span className="pill">
            session: <b>local</b>
          </span>
        </div>

        <div className="panel">
          <AnimatePresence mode="wait">
            {mode === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: "grid" }}
              >
                <ChatPanel />
              </motion.div>
            )}

            {mode === "prompt" && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: "grid" }}
              >
                <PromptPanel />
              </motion.div>
            )}

            {mode === "video" && (
  <motion.div
    key="video"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="panel"
  >
    <VideoPanel goPrompt={() => setMode("prompt")} />
  </motion.div>
)}
          </AnimatePresence>
        </div>

        <div className="helper">
          Hazır. Webhook URL’i ayarla ve Lina’ya soru sor.
        </div>
      </div>
    </div>
  );
}

import React from "react";
