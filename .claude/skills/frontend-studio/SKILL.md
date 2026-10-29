---
name: frontend-studio
description: Orchestrates this project's installed frontend, design-system, motion, and review skills into one staged workflow. Use for any UI, website, landing page, design system, component, glassmorphism, spatial-depth, scroll-motion, RTL/Arabic, accessibility, or visual-polish task in this repository. Routes each stage to the right installed skill and loads only what the task needs. Invoke as /frontend-studio <task description>.
argument-hint: "<وصف المهمة> — مثال: صفحة هبوط عربية بتصميم زجاجي وعمق بصري وحركة مدروسة"
---

# frontend-studio

مسار عمل واحد لمهام الواجهة في هذا المستودع. **لا تنسخ محتوى المهارات هنا** — استدعِ المهارة
المناسبة بمهمة محددة، وحمّل ما تحتاجه المهمة وحده.

## ١ · قبل أي شيء: اقرأ المشروع

1. `CLAUDE.md` — المبادئ غير القابلة للتفاوض (القسم ٢) والهوية (القسم ٦).
2. `src/lib/tokens.ts` — **المصدر الوحيد** لقيم الهوية. `ALLOWED_HEX` يحدّ الألوان.
3. `src/app/globals.css` — الـdesign tokens وطبقة الحركة القائمة.
4. `src/content/strings.ts` — النصوص المعتمدة، تُستخدم حرفيًا.
5. `src/components/ui/` — نظام التصميم القائم. `/kitchen-sink` يعرض كل حالاته.

قيود هذا المشروع تسبق أي توصية من أي مهارة:

- **لا لون خارج لوحة الصحة القابضة** — يفرضه `tests/palette.test.ts`.
- **لا مكتبة UI جاهزة** (`CLAUDE.md` §٣) — المكوّنات خاصة.
- **Janna LT بوزنين فقط** — لا وزن وسيط ولا سماكة مخلّقة.
- **ميزانية الحزمة الأولى < ١٨٠KB** مضغوطة — يفحصها `pnpm budget`.
- **`pnpm verify` يجب أن يمرّ** قبل أي commit.

## ٢ · اختر المسار من وصف المهمة

| المهمة | المسار |
|---|---|
| موقع أو صفحة هبوط | `frontend-design` للتكوين والاتجاه ← `copywriting` + `cro` **إن كان الهدف تسويقيًا** |
| نظام تصميم أو tokens | `ui-ux-pro-max` توصيةً فقط ← تُراجع مقابل `tokens.ts` ثم `design-system` |
| مكوّنات React | `shadcn` **إن ناسب المشروع** (انظر §٣) ← `vercel-react-best-practices` |
| حركة مرتبطة بالتمرير · تسلسل مركب · SVG | `gsap-scrolltrigger` · `gsap-timeline` · `gsap-plugins` (+ `gsap-react` للتنظيف) |
| حركة مكوّنات وتغيّر حالات | `motion` (المهارة الرسمية، MCP مجاني) |
| تحسين الإحساس بالحركة | `emil-design-eng` ← `animate` · `review-animations` · `animation-performance` |
| تجربة الجوال | `mobile-native` |
| حالات حدّية ونصوص واقعية | `break-ui` |
| اختيار مكتبة | `pick-ui-library` |
| نموذج سريع | `prototype` |
| مراجعة وصقل | `impeccable` ← `web-design-guidelines` |
| اختبار في متصفح فعلي | `webapp-testing` (Playwright مثبّت؛ اضبط `PLAYWRIGHT_CHROMIUM_EXECUTABLE`) |

وجود المهارات مثبتة لا يعني استدعاءها جميعًا في كل تعديل. مرّر لكل مهارة **مهمة محددة**.

## ٣ · العلاقة بين المهارات

- **تعليمات المستخدم والهوية المعتمدة تقود الاتجاه البصري.** لا مهارة تعيد اختيار هوية جديدة.
- لكل مرحلة مسؤولية واحدة: اقتراح ← تكوين ← تنفيذ ← صقل ← مراجعة ← اختبار.
- `ui-ux-pro-max` **يقترح** (ألوان، خطوط، أنماط) ويُراجع مقابل مواد المشروع؛ ما خالف `ALLOWED_HEX` يُرفض.
- `frontend-design` يقود التكوين والاتجاه البصري.
- `shadcn` يقدّم مكوّنات **تُخصّص للهوية**. تنبيه: `CLAUDE.md` §٣ يمنع مكتبة UI جاهزة، و`shadcn`
  يجرّ Radix/Base UI وclass-variance-authority. لا تستخدمه في هذا المستودع دون قرار صريح من المستخدم؛
  انسخ النمط يدويًا إلى `src/components/ui/` بدلًا من تثبيت المكتبة.
- `impeccable` يصقل النتيجة **مع الحفاظ على الاتجاه المطلوب**، لا ليستبدله.
- مهارات Vercel تراجع التنفيذ والأداء.
- مهارات التسويق تُستخدم عند وجود هدف تسويقي مناسب، لا في كل صفحة.
- **اختر أبسط أداة حركة تحقق النتيجة**: CSS أولًا، ثم Motion، ثم GSAP. طبقة الحركة في
  `globals.css` تغطي الدخول والرفع والوميض بلا مكتبة — ابدأ منها.
- GSAP وMotion يصحّ اجتماعهما بمسؤوليات منفصلة (GSAP للتمرير والتسلسل، Motion للمكوّنات).
- **لا تجعل مكتبتين تتحكمان في الخاصية نفسها للعنصر نفسه بالتزامن.**
- استخدم مهارات الأطر الموافقة للمشروع فقط: React/Next (`gsap-react`) — لا `gsap-frameworks`
  (Vue/Svelte) ولا `animate-expo` ولا `vercel-react-native-skills` هنا.
- أي مكتبة حركة تحتاج `pnpm add` وتحتسب على ميزانية ١٨٠KB. تحقّق بـ`pnpm budget` قبل الالتزام.

## ٤ · سياسة التصميم الزجاجي

التوجه مسموح عند طلبه: **Refined Glassmorphism · Controlled Blur · Spatial Depth ·
Premium Typography · Purposeful Motion**. لا تحذف الزجاج تلقائيًا لمجرد أنه نمط شائع.

عند تنفيذه:

1. **صمّم طبقات مفهومة:** خلفية ← سطح ← محتوى ← عناصر عائمة. لكل طبقة دور ولا تتزاحم.
2. **أوضِح العمق** بالشفافية والبلور والحواف والظلال معًا، لا بالبلور وحده.
3. **افصل شفافية السطح عن شفافية النص.** لا تخفض `opacity` للحاوية فيضعف المحتوى —
   اجعل الشفافية في خلفية السطح (`background: color-mix(...)` أو `rgb(... / α)`) والنص عند `opacity: 1`.
4. **حافظ على تباين قابل للقياس** فوق الخلفيات المتغيرة. اقس التباين فعلًا ولا تقدّره.
5. **وثّق القيم في tokens** قابلة لإعادة الاستخدام: لون السطح، نسبة الشفافية، نصف قطر البلور،
   الظل، ومدة الحركة. مكانها `src/lib/tokens.ts` و`globals.css`.
   **قيم الزجاج تُشتق من لوحة الهوية بإضافة قناة ألفا** — لا لون جديد، كي يمرّ `tests/palette.test.ts`.
6. **وفّر مظهرًا بديلًا واضحًا** عند غياب الدعم: `@supports not (backdrop-filter: blur(1px))`
   يعطي سطحًا معتمًا مقروءًا، لا شفافية بلا بلور.
7. **افحص كلفة البلور على الجوال** — خصوصًا المساحات الكبيرة والطبقات المتراكبة.
   قلّل مساحة التأثير وعدد الطبقات قبل أن تقلّل الاتجاه البصري.
8. **اجعل كثافة التأثير متناسبة مع وظيفة الصفحة.** شاشة إرسال مشاركة ليست صفحة عرض.

## ٥ · العربية والجوال والحركة

- **RTL بخصائص منطقية فقط**: `margin-inline` · `inset-inline-start` · `padding-inline`.
  لا `left`/`right`. تُعكس الأيقونات الاتجاهية وحدها.
- **الخط** Janna LT المعتمد. النص المختلط داخل `<bdi>`، والأرقام عربية-هندية عبر `toArabicDigits`،
  والمعرّفات والرموز لاتينية داخل `dir="ltr"`.
- اختبر **التفاف العناوين وطول التسميات بالنصوص الفعلية** من `strings.ts`، لا بنص بديل.
- احترم اللمس (هدف ≥ ٤٤px) والمناطق الآمنة (`env(safe-area-inset-*)`) ولوحة مفاتيح الجوال.
- دعم لوحة المفاتيح وحالات `:focus-visible` واضحة.
- **احترم `prefers-reduced-motion`** في كل حركة بلا استثناء.
- **لا تعطّل الوصول للمحتوى انتظارًا لحركة افتتاحية.** الافتتاحية تُتخطّى ولا تحجب.
- **نظّف** الـtimelines والمستمعين وScrollTriggers عند التفكيك (`useGSAP` أو `gsap.context`).
- راجع الحركة بصريًا بـ`webapp-testing` وتحقّق من سلاستها، لا بالقراءة وحدها.

## ٦ · أنهِ دائمًا بـ

```bash
pnpm verify     # lint + typecheck + حارس المخطط + الاختبارات
pnpm build && pnpm budget   # ميزانية الحزمة الأولى
```

ولا تُنهِ مهمة والفحص أحمر.
