/* eslint-disable @next/next/no-img-element -- شعاران SVG ثابتان بنسبتهما الأصلية */
import type { Metadata } from "next";
import { CardForm } from "@/components/app/CardForm";
import { CARD } from "@/content/card";
import "./card.css";

export const metadata: Metadata = { title: "سؤالك يفتح الحوار — جسر التحول", description: CARD.lede, robots: { index: false } };

/**
 * صفحة مستقلة عن بقية المنصة: لا شريط تنقّل ولا مشهد افتتاح. يصلها الموظف من باركود الرول أب.
 * التصميم نسخة رقمية من البطاقة المطبوعة (docs/print): غلاف داكن يمينًا، وبطاقة الكتابة يسارًا.
 */
export default function CardPage() {
  return (
    <main className="qcard-page">
      <div className="qcard">
        <section className="qcard-cover" aria-labelledby="qcard-title">
          <div className="qcard-logos logo-island">
            <img src="/brand/jouf-health-cluster.svg" alt="تجمع الجوف الصحي" width={922} height={882} />
            <span className="qcard-logos-rule" aria-hidden="true" />
            <img src="/brand/hadithah-logo.svg" alt="مستشفى الحديثة العام" width={922} height={882} />
          </div>

          <div className="qcard-head">
            <p className="qcard-eyebrow"><span>{CARD.eyebrow}</span><span className="qcard-dot" aria-hidden="true" /><span>{CARD.eyebrowTail}</span></p>
            <h1 id="qcard-title" className="qcard-headline">{CARD.headline.map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="qcard-sub">{CARD.sub}</p>
          </div>

          <div className="qcard-bubbles" aria-hidden="true">
            {/* الجسر يتحرك مع الفقاعتين أينما وقعتا، فلا يمرّ خلف نص */}
            <svg className="qcard-bridge" viewBox="0 0 438 222" preserveAspectRatio="none">
              <defs>
                <linearGradient id="qcard-arc" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#04A67A" stopOpacity=".3" />
                  <stop offset=".45" stopColor="#9ECC3B" />
                  <stop offset=".6" stopColor="#9ECC3B" />
                  <stop offset="1" stopColor="#04A67A" stopOpacity=".3" />
                </linearGradient>
              </defs>
              <path className="qcard-bridge-glow" d="M0 206C94 206 92 0 214 0S344 206 438 206" />
              <path className="qcard-bridge-line" d="M0 206C94 206 92 0 214 0S344 206 438 206" />
              <path className="qcard-bridge-line qcard-bridge-line--soft" d="M0 222C110 222 108 16 214 16S328 222 438 222" />
            </svg>
            <div className="qcard-bubble qcard-bubble--back">
              <svg viewBox="0 0 100 72" preserveAspectRatio="none"><path d="M12 0h76a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H30L14 72l2-14h-4A12 12 0 0 1 0 46V12A12 12 0 0 1 12 0Z" /></svg>
              <span className="qcard-q">؟</span>
            </div>
            <div className="qcard-bubble qcard-bubble--front">
              <svg viewBox="0 0 100 72" preserveAspectRatio="none"><path d="M12 0h76a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12h-4l2 14-16-14H12A12 12 0 0 1 0 46V12A12 12 0 0 1 12 0Z" /></svg>
              <span className="qcard-dots"><i /><i /><i /></span>
            </div>
          </div>

          <p className="qcard-lede">{CARD.lede} <b>{CARD.ledeStrong}</b></p>
        </section>

        <section className="qcard-form" aria-label="بطاقة المشاركة">
          <CardForm />
        </section>
      </div>
    </main>
  );
}
