"use client";

import { useState } from "react";
import Image from "next/image";
import { GateCard } from "@/components/ui/GateCard";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Chip } from "@/components/ui/Chip";
import { StatusTag } from "@/components/ui/StatusTag";
import { IssueCard } from "@/components/ui/IssueCard";
import { BottomTabs, TABS, type TabKey } from "@/components/ui/BottomTabs";
import { Sheet } from "@/components/ui/Sheet";
import { Icon, type IconName } from "@/components/ui/Icon";
import { STRINGS } from "@/content/strings";
import {
  BRAND_PALETTE,
  MOTION,
  SHAPE,
  STATUS_COLORS,
  STATUS_KEYS,
  SURFACE_TOKENS,
} from "@/lib/tokens";
import { toArabicDigits } from "@/lib/numerals";

const ICON_GALLERY: readonly IconName[] = [
  "question", "concern", "challenge", "idea", "rumor",
  "dot", "eye", "forward", "clock", "check", "escalate",
  "home", "issues", "knowledge", "track",
  "send", "retry", "close", "plus", "vote", "merge", "chevronDown", "drag", "lock", "spark", "journey", "pulse",
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4 border-t border-line px-4 py-8">
      <div>
        <h2 className="text-screen-title font-bold text-ink">{title}</h2>
        {note ? <p className="mt-1 text-secondary text-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StateLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-tag text-faint">{children}</p>;
}

export function KitchenSink() {
  const [activeTab] = useState<TabKey>("home");
  const [selectedChip, setSelectedChip] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [voted, setVoted] = useState(false);

  return (
    <main className="mx-auto max-w-[430px] bg-panel pb-24">
      <header className="surface-dark px-4 pt-6 pb-8">
        <Image
          src="/brand/health-holding-lockup.webp"
          alt="شعار شركة الصحة القابضة"
          width={132}
          height={132}
          priority
          className="brand-lockup--light h-auto w-[132px]"
        />
        <h1 className="mt-6 text-screen-title font-bold">نظام التصميم</h1>
        <p className="mt-2 text-body text-on-dark/80">
          كل قيمة هنا من دليل الهوية الرسمي — لا لون مبتكر ولا مقاس خارج السلّم.
        </p>
      </header>

      {/* ================= الألوان ================= */}
      <Section
        id="palette"
        title="لوحة الهوية"
        note="الأزرقان 2985C و299C لا يُستخدمان لنص على أبيض؛ النصوص والأفعال على 2736C."
      >
        <ul className="grid grid-cols-2 gap-3">
          {Object.entries(BRAND_PALETTE).map(([pantone, hex]) => (
            <li key={pantone} className="overflow-hidden rounded-card border border-line">
              <span className="block h-14" style={{ backgroundColor: hex }} />
              <span className="flex flex-col gap-0.5 p-3">
                <b className="text-secondary text-ink">{pantone}</b>
                <span className="code-ltr text-tag text-muted">{hex}</span>
              </span>
            </li>
          ))}
        </ul>

        <StateLabel>الأسطح والنص والحدود</StateLabel>
        <ul className="grid grid-cols-2 gap-3">
          {Object.entries(SURFACE_TOKENS).map(([name, hex]) => (
            <li key={name} className="flex items-center gap-3 rounded-card border border-line p-3">
              <span
                className="size-8 shrink-0 rounded-icon border border-line"
                style={{ backgroundColor: hex }}
              />
              <span className="flex min-w-0 flex-col">
                <b className="code-ltr text-tag text-ink">{name}</b>
                <span className="code-ltr text-tag text-muted">{hex}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================= الطباعة ================= */}
      <Section
        id="type"
        title="الطباعة"
        note="Janna LT بوزنين فقط: Regular و Bold — لا وزن وسيط ولا سماكة مخلّقة."
      >
        <p className="text-screen-title font-bold text-ink">عنوان شاشة — ٢٢px / ٧٠٠</p>
        <p className="text-card-title font-bold text-ink">عنوان بطاقة — ١٦px / ٧٠٠</p>
        <p className="text-body text-ink">نص أساسي — ١٥px / ٤٠٠ · ارتفاع السطر ١٫٨</p>
        <p className="text-secondary text-muted">نص ثانوي — ١٣px / ٤٠٠</p>
        <p className="text-tag text-faint">وسم حالة — ١٢px / ٤٠٠</p>
        <p className="code-ltr text-code text-ink">A7K4M9QP</p>
        <StateLabel>الأرقام في الواجهة عربية-هندية: {toArabicDigits(1234567890)}</StateLabel>
        <StateLabel>
          النص المختلط يُغلَّف بـ <bdi className="code-ltr">bdi</bdi> لمنع انقلاب الترتيب.
        </StateLabel>
      </Section>

      {/* ================= بطاقة بوابة ================= */}
      <Section id="gate-card" title="بطاقة بوابة" note="عادية · مضغوطة · تركيز لوحة مفاتيح">
        <StateLabel>عادية</StateLabel>
        <GateCard
          icon="question"
          title={STRINGS.gateTitles.question}
          hint={STRINGS.gateOpeners.question}
        />
        <GateCard
          icon="concern"
          title={STRINGS.gateTitles.concern}
          hint={STRINGS.gateOpeners.concern}
        />

        <StateLabel>مضغوطة</StateLabel>
        <GateCard
          icon="challenge"
          title={STRINGS.gateTitles.challenge}
          hint={STRINGS.gateOpeners.challenge}
          pressed
        />

        <StateLabel>تركيز لوحة المفاتيح — انتقل إليها بمفتاح Tab</StateLabel>
        <GateCard icon="idea" title={STRINGS.gateTitles.idea} hint={STRINGS.gateOpeners.idea} />
      </Section>

      {/* ================= فقاعة محادثة ================= */}
      <Section
        id="chat-bubble"
        title="فقاعة محادثة"
        note="واردة · صادرة · جارٍ الكتابة · فشل الإرسال مع إعادة المحاولة"
      >
        <div className="flex flex-col gap-3">
          <StateLabel>واردة</StateLabel>
          <ChatBubble side="incoming">{STRINGS.gateOpeners.concern}</ChatBubble>

          <StateLabel>صادرة</StateLabel>
          <ChatBubble side="outgoing">
            ما زال غير واضح كيف ستُحتسب مدة الخدمة بعد الانتقال.
          </ChatBubble>

          <StateLabel>جارٍ الكتابة</StateLabel>
          <ChatBubble side="incoming" typing />

          <StateLabel>فشل الإرسال</StateLabel>
          <ChatBubble side="outgoing" failed>
            لم يصل هذا النص بعد.
          </ChatBubble>
        </div>
      </Section>

      {/* ================= رقاقة ================= */}
      <Section id="chip" title="رقاقة اختيار" note="عادية · مختارة · معطّلة — مقترحة لا مُلزِمة">
        <div className="flex flex-wrap gap-2">
          <Chip selected={selectedChip} onClick={() => setSelectedChip((v) => !v)}>
            مختارة
          </Chip>
          <Chip>عادية</Chip>
          <Chip disabled>معطّلة</Chip>
        </div>
      </Section>

      {/* ================= وسم حالة ================= */}
      <Section
        id="status-tag"
        title="وسم حالة"
        note="ست حالات — لكل واحدة لون + رمز + نص، ولا تُنقل الحالة باللون وحده."
      >
        <div className="flex flex-wrap gap-2">
          {STATUS_KEYS.map((status) => (
            <StatusTag key={status} status={status} />
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {STATUS_KEYS.map((status) => (
            <li key={status} className="flex items-center justify-between gap-3 text-tag">
              <span className="code-ltr text-muted">{status}</span>
              <span className="code-ltr text-muted">{STATUS_COLORS[status].fg}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================= بطاقة قضية ================= */}
      <Section id="issue-card" title="بطاقة قضية" note="مع/بلا إجابة · صوّت · مُدمجة">
        <StateLabel>بلا إجابة</StateLabel>
        <IssueCard
          title="كيف تُحتسب مدة الخدمة بعد الانتقال؟"
          topic="العقود"
          status="referred"
          interestedCount={162}
          voted={voted}
          onVote={() => setVoted(true)}
        />

        <StateLabel>مع إجابة معتمدة</StateLabel>
        <IssueCard
          title="هل يتغيّر موعد صرف الراتب؟"
          topic="الرواتب والبدلات"
          status="answered"
          interestedCount={77}
          answer="موعد الصرف يبقى كما هو خلال مرحلة الانتقال."
          answerSource="تعميم فريق التحول — ١٤ محرم"
          voted
        />

        <StateLabel>مُدمجة</StateLabel>
        <IssueCard
          title="متى تصدر الهياكل الجديدة؟"
          topic="الهيكل والصلاحيات"
          status="waiting"
          interestedCount={41}
          merged
          mergedIntoTitle="جدول إصدار الهياكل والصلاحيات"
        />
      </Section>

      {/* ================= لوح سفلي ================= */}
      <Section id="sheet" title="لوح سفلي" note="يُغلق بالسحب لأسفل وبالزر وبمفتاح Escape.">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-button bg-hh-2736 px-4 py-3 text-body font-bold text-panel"
        >
          <Icon name="plus" size={16} />
          <span>افتح اللوح</span>
        </button>

        <div className="relative h-64 overflow-hidden rounded-card border border-line bg-panel-2">
          <p className="p-4 text-secondary text-muted">اللوح يظهر داخل هذا الإطار في المعرض.</p>
          <Sheet contained open={sheetOpen} title="تأكيد الإرسال" onClose={() => setSheetOpen(false)}>
            <p>{STRINGS.privacyNotice}</p>
          </Sheet>
        </div>
      </Section>

      {/* ================= الأيقونات ================= */}
      <Section
        id="icons"
        title="الأيقونات"
        note="شبكة ٢٤ · سماكة ١٫٦ ثابتة · أحادية ترث لون النص · التمييز بالشكل لا باللون."
      >
        <ul className="grid grid-cols-4 gap-3">
          {ICON_GALLERY.map((name) => (
            <li
              key={name}
              className="flex flex-col items-center gap-2 rounded-card border border-line p-3 text-hh-2736"
            >
              <Icon name={name} size={22} />
              <span className="code-ltr text-tag text-muted">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================= المسافات والحركة ================= */}
      <Section id="shape" title="المسافات والأشكال والحركة">
        <ul className="flex flex-col gap-2 text-secondary text-ink-soft">
          <li>
            وحدة المسافة {toArabicDigits(SHAPE.spacingUnit)}px · السلّم{" "}
            {SHAPE.spacingScale.map((s) => toArabicDigits(s)).join(" / ")}
          </li>
          <li>
            هامش الشاشة {toArabicDigits(SHAPE.screenPaddingInline)}px جانبيًا ·{" "}
            {toArabicDigits(SHAPE.screenPaddingBlockStart)}px أعلى المحتوى
          </li>
          <li>
            الاستدارة: بطاقة {toArabicDigits(SHAPE.radiusCard)}px · زر{" "}
            {toArabicDigits(SHAPE.radiusButton)}px · وسم {toArabicDigits(SHAPE.radiusTag)}px
          </li>
          <li>
            الحدود {toArabicDigits(SHAPE.borderWidth)}px بلون{" "}
            <span className="code-ltr">{SURFACE_TOKENS.line}</span> — بلا ظلال
          </li>
          <li>
            أصغر مساحة لمس {toArabicDigits(SHAPE.minTouchTarget)}×
            {toArabicDigits(SHAPE.minTouchTarget)}px بلا استثناء
          </li>
          <li>
            الحركة {toArabicDigits(MOTION.enterMs)}ms دخول · {toArabicDigits(MOTION.exitMs)}ms خروج
            · تُحترم prefers-reduced-motion
          </li>
        </ul>

        <div className="flex items-end gap-2">
          {SHAPE.spacingScale.map((size) => (
            <span key={size} className="flex flex-col items-center gap-1">
              <span className="bg-hh-2736" style={{ inlineSize: size, blockSize: size }} />
              <span className="code-ltr text-tag text-muted">{size}</span>
            </span>
          ))}
        </div>
      </Section>

      {/* ================= الشريط السفلي ================= */}
      <Section id="bottom-tabs" title="الشريط السفلي" note="أربعة عناصر ثابتة — النشط بلون ونص معًا.">
        <div className="overflow-hidden rounded-card border border-line">
          <BottomTabs active={activeTab} />
        </div>
        <StateLabel>العنصر النشط: {TABS.find((t) => t.key === activeTab)?.label} — العناصر روابط حقيقية</StateLabel>
      </Section>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px]">
        <BottomTabs active={activeTab} />
      </div>
    </main>
  );
}
