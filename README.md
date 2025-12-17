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
