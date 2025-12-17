# Lina Chat Assistant 🤖

Lina, SpektrumCreative tarafından geliştirilen,
n8n tabanlı otomasyonlara bağlı çalışan,
çok modlu (chat / prompt) bir AI asistan arayüzüdür.

Bu repo **sadece frontend** tarafını içerir.
Tüm zeka ve üretim süreçleri n8n webhook’ları üzerinden yürütülür.

---

## 🎯 Amaç

- Chat modu → Genel soru / cevap
- Prompt modu → Veo / Banana / Sora gibi modeller için **profesyonel prompt üretimi**
- Aynı UI, farklı **mode** ile backend otomasyonunu yönlendirir

---

## 🧠 Mimari Genel Bakış

```txt
[ Next.js UI ]
      |
      |  POST
      v
[ n8n Webhook ]
      |
      v
[ Lina AI Agent ]
      |
      v
[ Respond to Webhook ]
🧩 Modlar (Mode Sistemi)
| Mode   | Açıklama                             |
| ------ | ------------------------------------ |
| chat   | Genel sohbet, soru–cevap             |
| prompt | Prompt üretimi (Veo / Banana / Sora) |
Mode bilgisi backend’de routing + prompt zinciri için kullanılır.
🔗 Webhook Entegrasyonu

Frontend, aşağıdaki environment değişkenini kullanır:
NEXT_PUBLIC_LINA_WEBHOOK_URL=https://api-n8n-xxxx/webhook/lina/chat
Gönderilen payload örneği:
{
  "message": "Tapu masraflarını kim öder?",
  "mode": "chat",
  "sessionId": "sess_xxx",
  "meta": {
    "target": "prompt_lab"
  }
}
🖥️ UI Bileşenleri

ChatPanel.tsx → Chat UI

PromptPanel.tsx → Prompt üretim UI

Shell.tsx → Mode switch + layout

ChatPanel ve PromptPanel aynı altyapıyı kullanır, fark sadece mode’dur.
🛠️ Teknoloji

Next.js (App Router)

TypeScript

SCSS (Tailwind kullanılmaz)

n8n Webhook backend
🚧 Roadmap

 Chat memory (Postgres / Supabase)

 Streaming response

 Prompt preset’leri

 Role / persona switching

Kaydet → commit et:

```bash
git add README.md
git commit -m "Add project README with architecture and webhook contract"
git push
