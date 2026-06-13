# أصول شخصية طيف (v2.1)

## العرض الافتراضي — PNG شفافة + حركة CSS

| الملف | الاستخدام |
|-------|-----------|
| `transparent/confident.png` | الوضع الأساسي (idle / walk / count) |
| `transparent/talk.png` | أثناء الكلام / typewriter |
| `transparent/sassy.png` | ردود سلبية (react_bad) |
| `transparent/welcome.png` | احتفال / react_good |
| `transparent/dramatic.png` | جولة المفاجأة |
| `transparent/bored.png` | مرجع اختياري |

إزالة الخلفية البيضاء: `npm run remove-bg` (يتطلب `sharp`)

## Lottie — ترقية اختيارية

| الملف | الوصف |
|-------|--------|
| `taif-character.json` | حركة Lottie — **يُفعَّل فقط** مع `?lottie=1` في الرابط |

حالات Lottie (markers): `idle`, `walk`, `talk`, `count`, `react_bad`, `react_good`

- إعادة توليد JSON البسيط: `npm run generate-lottie`
- بناء JSON من PNG (اختياري): `node scripts/build-lottie-from-png.mjs`

## تخطيطات UX (`data-layout`)

| الوضع | الشاشات | السلوك |
|-------|---------|--------|
| `hero` | ترحيب، فرق، مقدمة، اختيار لعبة، مفاجأة، نتائج | شخصية كبيرة + فقاعة كاملة |
| `compact` | 7 شاشات الألعاب | Host Bar أفقي: [شخصية][مؤقت xl][نص] |
| `grid` | ذاكرة / خمن أثناء اللعب | Bar علوي + مشي الشخصية فوق الخلايا |

## مكتبة

`js/vendor/lottie.min.js` — lottie-web 5.12.2
