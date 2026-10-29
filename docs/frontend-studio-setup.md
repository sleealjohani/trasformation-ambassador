# سجل إعداد frontend-studio

إعداد بيئة عمل الواجهة في هذا المستودع. وُلّد بتنفيذ فعلي — لا قيم إصدار ولا نتائج تحقق مُفترضة.

**تاريخ التنفيذ:** 2026-10-29 · **Node** v22.22.0 · **npm** 10.9.4 · **pnpm** 10.33.0 · **git** 2.43.0 · **python** 3.11.17

---

## ١ · المهارات المثبتة ومصادرها

جميع المهارات **نسخ فعلية** في `.claude/skills/` (لا روابط رمزية)، ولكل واحدة `SKILL.md` صالح.

| المهارة | المصدر | الدور |
|---|---|---|
| `animate` | emilkowalski/skills | بناء حركة من الصفر |
| `animation-performance` | emilkowalski/skills | ميزانية الإطار وأسباب التقطيع |
| `banner-design` | ui-ux-pro-max-cli | تصميم البانرات |
| `brand` | ui-ux-pro-max-cli | صوت العلامة ورسائلها |
| `break-ui` | emilkowalski/skills | حالات حدّية ونصوص واقعية |
| `copywriting` | coreyhaines31/marketingskills | نصوص صفحات الهبوط |
| `cro` | coreyhaines31/marketingskills | ترتيب الصفحة حول هدف التحويل |
| `design` | ui-ux-pro-max-cli | هوية ومخرجات تصميمية |
| `design-system` | ui-ux-pro-max-cli | معمارية الـtokens ومواصفات المكوّنات |
| `emil-design-eng` | emilkowalski/skills | جودة التفاصيل والإحساس |
| `frontend-design` | anthropics/skills | الاتجاه البصري والتكوين |
| `frontend-studio` | محلية (هذا المستودع) | **التنظيم** — محلية، كُتبت في هذا الإعداد |
| `gsap-core` | greensock/gsap-skills | واجهة GSAP الأساسية والـeasing |
| `gsap-frameworks` | greensock/gsap-skills | Vue/Svelte — غير مستخدمة هنا |
| `gsap-performance` | greensock/gsap-skills | أداء الحركة |
| `gsap-plugins` | greensock/gsap-skills | الإضافات وSVG والفيزياء |
| `gsap-react` | greensock/gsap-skills | useGSAP والتنظيف عند التفكيك |
| `gsap-scrolltrigger` | greensock/gsap-skills | الحركة المرتبطة بالتمرير والتثبيت |
| `gsap-timeline` | greensock/gsap-skills | التسلسل والتزامن |
| `gsap-utils` | greensock/gsap-skills | أدوات مساعدة |
| `impeccable` | pbakaus/impeccable | مراجعة التصميم وصقله والوصول |
| `mobile-native` | emilkowalski/skills | إحساس أصلي على الجوال |
| `motion` | motiondivision/ai-kit | مهارة Motion الرسمية + MCP |
| `pick-ui-library` | emilkowalski/skills | اختيار المكتبة |
| `prototype` | emilkowalski/skills | نماذج سريعة |
| `review-animations` | emilkowalski/skills | نقد حركة قائمة |
| `shadcn` | shadcn-ui/ui | مكوّنات shadcn — بقيد (انظر §٦) |
| `slides` | ui-ux-pro-max-cli | عروض HTML |
| `ui-styling` | ui-ux-pro-max-cli | تنفيذ الأنماط والتجاوب |
| `ui-ux-pro-max` | ui-ux-pro-max-cli | توصيات نظام التصميم والألوان والخطوط |
| `vercel-react-best-practices` | vercel-labs/agent-skills | أداء React وNext.js |
| `web-design-guidelines` | vercel-labs/agent-skills | مراجعة الوصول والتفاعل |
| `webapp-testing` | anthropics/skills | اختبار فعلي في متصفح (Playwright) |

**العدد:** 33 مهارة.

### الإصدارات والمراجع المتاحة فعلًا

- **impeccable:** محرّك `0.1.18` · حزمة المهارات v4.8.0 (أبلغ عنها المثبّت)
- **motion-ai:** `14.2.0` (قُرئ من المثبّت)
- **بقية المهارات:** لا تحمل حقل `version`. `skills-lock.json` يقفل **٢٤** منها بـ`computedHash` — وهي ما ثبّته `skills` CLI وحده. مهارات `ui-ux-pro-max-cli` السبع و`impeccable` و`frontend-studio` خارج هذا القفل لأن مثبّتيها لا يكتبان فيه؛ تُحدَّث بأوامرها في §٥.

---

## ٢ · مسارات التثبيت الفعلية

```
.claude/skills/<name>/SKILL.md     المهارات — ٣٣ مجلدًا، نسخ فعلية
.claude/skills/frontend-studio/    مهارة التنظيم المحلية
.claude/agents/impeccable-*.md     ٤ وكلاء impeccable
.claude/settings.local.json        خطّافات impeccable
.mcp.json                          خادم Motion MCP (نطاق المشروع)
skills-lock.json                   قفل المصادر والتجزئات
docs/frontend-studio-setup.md      هذا الملف
```

`.claude/skills/impeccable/scripts/bin/` مستثنى في `.gitignore`: ثنائي ٢١ ميغابايت خاص
بـ`linux-x64`، يُعاد توليده بـ`npx impeccable install`.

---

## ٣ · طريقة تشغيل frontend-studio

```
/frontend-studio <وصف المهمة>
```

تقرأ المهارة وصف المهمة وأصول المشروع (`CLAUDE.md`، `tokens.ts`، `globals.css`،
`strings.ts`، `src/components/ui/`) ثم تختار المسار وتستدعي المهارات المعنية بمهمة محددة لكل
واحدة — لا تستدعيها كلها. تحمل كذلك سياسة التصميم الزجاجي وقواعد العربية والجوال والحركة.

---

## ٤ · حالة MCP

| الخادم | النطاق | الحالة |
|---|---|---|
| `motion` → `https://mcp.motion.dev` | المشروع (`.mcp.json`) | **مُعدّ على القرص. الاتصال لم يُتحقق منه بعد** — يظهر في جلسة جديدة |
| `motion-plus` → `https://mcp.motion.dev/plus` | — | **لم يُعدّ بقرارك**: خدمة Motion+ مدفوعة |

النقطتان مقروءتان من مصدر مثبّت `motion-ai` (`package/dist/install.js`) لا من تخمين، والصيغة
`{ "type": "http", "url": … }` هي ما يكتبه المثبّت لـClaude Code.

الخوادم الأخرى في الجلسة (GitHub · Supabase · Vercel · Neon …) تُدار على مستوى الحساب لا
المستودع، ولم يمسّها هذا الإعداد: `.mcp.json` أُنشئ جديدًا ويحمل `motion` وحده.

---

## ٥ · طريقة التحديث

```bash
npx skills@latest list -a claude-code        # ما هو مثبّت
npx skills@latest update --project -y        # تحديث مهارات skills CLI
npx ui-ux-pro-max-cli@latest update --ai claude
npx impeccable@latest install --providers=claude --scope=project --force
npx skills@latest experimental_install       # استعادة من skills-lock.json
```

**تنبيه:** المثبّتات تكتب فوق محتوى المهارات. `frontend-studio` محلية ولا يلمسها أي مثبّت،
لكن لا تعدّل ملفات الطرف الثالث — أي تخصيص يوضع في `frontend-studio`.

**صيغة أسماء متعددة:** `--skill a b c` بفراغات. الفواصل (`a,b,c`) **لا تعمل** — تُقرأ اسمًا
واحدًا فيفشل الأمر صامتًا ويعرض القائمة المتاحة. سُجّل هذا لأن أمر المستخدم الأصلي استخدمها.

---

## ٦ · ما استُبعد وسببه

| المستبعد | السبب |
|---|---|
| Taste Skill · `design-taste-frontend` | **باستثنائك الصريح.** تحقّقت من غيابهما. |
| `motion-plus` MCP | خدمة مدفوعة؛ طلبت النسخة المجانية وحدها. |
| `gsap-frameworks` · `animate-expo` · `vercel-react-native-skills` | مثبّتة أو متاحة لكن **لا تُستخدم**: أطر Vue/Svelte/React Native لا تطابق المشروع. |

### لم تُستبعد أي مهارة بسبب منع الزجاج

فحصت نصوص المهارات بحثًا عن منع مطلق لـGlass أو `backdrop-filter` أو Blur. النتيجة:

- **لا منع مطلق في أي مهارة مثبتة.**
- الإشارة الوحيدة: `.claude/skills/impeccable/reference/ios.md:33` —
  «System materials for blur and translucency behind bars and sheets; no hand-rolled
  glassmorphism». سياقها **iOS الأصلي** (استخدم مواد النظام بدل تقليد الزجاج يدويًا)،
  ولا تنطبق على ويب. وفي المقابل يُدرج impeccable صراحةً
  «blur, backdrop-filter, clip-path, mask, and shadow» ضمن أدواته المعتمدة للحركة.
- `animation-performance` و`ui-ux-pro-max` يحذّران من **كلفة** البلور على الأداء — تحذير
  لا منع، وهو مُدمج في البند ٧ من سياسة الزجاج.

لم يُعدّل أي ملف طرف ثالث لإخفاء تعارض.

### تعارضات مع `CLAUDE.md` سُجّلت ولم تُحسم بالكود

1. **`shadcn` ضد §٣ «لا مكتبة UI جاهزة».** المهارة مثبتة لكن استخدامها في هذا المستودع
   يحتاج قرارًا صريحًا. البديل: نسخ النمط يدويًا إلى `src/components/ui/`.
2. **`ui-ux-pro-max` يقترح لوحات وخطوطًا** خارج لوحة الصحة القابضة. توصياته تُراجع مقابل
   `ALLOWED_HEX`، ويرفضها `tests/palette.test.ts` تلقائيًا.
3. **ميزانية ١٨٠KB.** الحزمة الأولى الآن ١٦٦٫٣KB، فالمتبقّي ≈١٣٫٧KB. GSAP أو Motion
   يحتاج `pnpm add` ويُحتسب عليها. لم تُضف أي مكتبة حركة في هذا الإعداد.

---

## ٧ · إجراءات يدوية متبقية

1. **خادم Motion MCP يحتاج جلسة جديدة** ليُحمّل. تحقّق بـ`/mcp` في Claude Code.
   إن طلب مصادقة OAuth فهي خطوة يدوية في عميلك.
2. **`npx motion-ai` التفاعلي لم يُنفّذ**: يرفض العمل بلا طرفية حقيقية
   («motion-ai is interactive — run it in a terminal») ولا يوثّق خيارات غير تفاعلية.
   أُنجز أثره بمسارين موثقين بديلين: المهارة عبر `skills add motiondivision/ai-kit --skill motion`،
   وإعداد MCP بالصيغة المقروءة من مصدر المثبّت. شغّله في طرفيتك إن أردت مطابقة المثبّت حرفيًا.
3. **خطّافات impeccable تنفّذ ثنائيًا مُصرَّفًا** عند `SessionStart` وبعد كل `Edit`/`Write`
   وعند `Stop`. لم أفحص الثنائي — لا يمكن فحصه. تحذير المثبّت: «تعمل بكامل صلاحيات الوكيل».
4. **`.claude/settings.local.json` مدفوع إلى مستودع عام.** بالعُرف ملف شخصي؛ أي صلاحية
   شخصية تضيفها فيه ستُدفع. يمكن نقل الخطّافات إلى `.claude/settings.json` المشترك.

---

## ٨ · تعديل لازم على إعداد المشروع

`eslint.config.mjs` كان يفحص سكربتات مهارات الطرف الثالث
(`.claude/skills/{brand,design-system,impeccable}/scripts/*.{cjs,js}`) فصار `pnpm verify`
أحمر بـ١٥ خطأ. استُثني `.claude/**` و`.agents/**` من ESLint: ملفات طرف ثالث ليست من كود
المشروع ولا تُعدَّل. لم يُلمس أي ملف مهارة.
