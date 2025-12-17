// lib/session.ts
export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "guest";
  const key = "lina_session_id";
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = `sess_${crypto.randomUUID().replaceAll("-", "")}`;
    localStorage.setItem(key, sid);
  }
  return sid;
}
