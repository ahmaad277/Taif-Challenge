# تحديات طيف (Taif Challenge)

لعبة جماعية تفاعلية بالعربية — طيف مضيفتكم في الاستوديو.

## العرض المباشر

- **الدومين:** [https://t.azhub.uk](https://t.azhub.uk) (بعد إعداد DNS)
- **Vercel:** [https://taif-challenge.vercel.app](https://taif-challenge.vercel.app)

## إعداد DNS في Cloudflare (خطوة واحدة)

في [Cloudflare Dashboard](https://dash.cloudflare.com) → `azhub.uk` → **DNS** → **Add record**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| **A** | `t` | `76.76.21.21` | **DNS only** (سحابة رمادية) |

لا تعدّل سجلات `@` أو `www`. بعد 5–30 دقيقة يفعّل Vercel شهادة HTTPS تلقائياً.

## التشغيل محلياً

افتح `index.html` في المتصفح، أو شغّل أي خادم محلي ثابت على جذر المشروع.

## البنية

- `index.html` — الصفحة الرئيسية
- `css/` — التنسيق
- `js/` — منطق اللعبة والبيانات
- `assets/` — صور الشخصية وأصول الألعاب

## التطوير (اختياري)

```bash
npm install
npm run remove-bg
npm run generate-lottie
```
