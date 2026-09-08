"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STRINGS } from "@/content/strings";
import { setSoundOn } from "@/lib/sound";
import { readLocal, writeLocal } from "@/lib/storage";

/** مراحل التحول: من علامة وزارة الصحة إلى علامة الصحة القابضة. */
type Phase = "old" | "core" | "emerge" | "form" | "final" | "hold";

/** جدول زمني مطابق لملف الحركة المعتمد */
const TIMELINE: ReadonlyArray<[Phase, number]> = [
  ["core", 720],
  ["emerge", 1180],
  ["form", 2200],
  ["final", 2920],
  ["hold", 3550],
];

const HOLD_MS = 1500;
const FADE_MS = 700;
const SEEN_KEY = "bridge:intro-seen";

/**
 * يُرسَم المشهد على الخادم أيضًا ليكون حاضرًا في أول رسم، فلا تومض الرئيسية قبله.
 * ومن رآه في هذه الجلسة يُخفى عنه قبل الرسم عبر السطر البرمجي في `layout.tsx`
 * الذي يضع `data-intro-seen` على جذر الصفحة، وتخفيه القاعدة في `intro.css`.
 */
export function Intro() {
  return <IntroStage />;
}

function IntroStage() {
  // الحالة الابتدائية واحدة على الخادم والعميل، فلا يختلف الترطيب
  const [show, setShow] = useState(true);
  // من يطلب تقليل الحركة يرى العلامة الجديدة مباشرة بلا مشهد
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState<Phase>("old");
  const [complete, setComplete] = useState(false);
  const [gone, setGone] = useState(false);
  const [soundOn, setSound] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback(() => {
    setComplete(true);
    const audio = audioRef.current;
    if (audio) {
      // تلاشٍ سمعي بدل القطع المفاجئ
      const step = audio.volume / 14;
      const fade = window.setInterval(() => {
        audio.volume = Math.max(0, audio.volume - step);
        if (audio.volume <= 0.01) {
          window.clearInterval(fade);
          audio.pause();
        }
      }, FADE_MS / 14);
    }
    window.setTimeout(() => setGone(true), FADE_MS);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // وضع خاص — تُعرض المقدمة مجددًا، ولا ضرر
    }
  }, []);

  // بعد التركيب: نقرأ ما يخص هذا الجهاز — هل رآه؟ وهل يطلب تقليل الحركة؟ وهل الصوت مكتوم؟
  // القراءة لا تصحّ قبل التركيب: الخادم لا يعرف تخزين الجهاز، والرسم الأول يجب أن يتطابق.
  /* eslint-disable react-hooks/set-state-in-effect -- مزامنة مع تخزين الجهاز لا تتالي رسم */
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      setShow(false);
      setGone(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setPhase("hold");
    }
    if (readLocal<boolean>("bridge:sound") === false) setSound(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!show || gone) return;
    document.documentElement.style.overflow = "hidden";

    if (reduced) {
      timers.current.push(window.setTimeout(dismiss, 900));
    } else {
      for (const [next, at] of TIMELINE) {
        timers.current.push(window.setTimeout(() => setPhase(next), at));
      }
      const last = TIMELINE[TIMELINE.length - 1];
      timers.current.push(window.setTimeout(dismiss, (last?.[1] ?? 3550) + HOLD_MS));
    }

    const ids = timers.current;
    return () => {
      ids.forEach(window.clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, [show, gone, reduced, dismiss]);

  // الصوت: يُشغَّل مع المقدمة. المتصفح قد يمنع التشغيل التلقائي، فنعيد المحاولة
  // عند أول لمسة، ويبقى المفتاح ظاهرًا في كل الأحوال.
  useEffect(() => {
    if (!show || gone || !soundOn) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.85;

    let cancelled = false;
    const attempt = () => {
      if (cancelled) return;
      void audio.play().catch(() => undefined);
    };
    attempt();
    const onGesture = () => attempt();
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [show, gone, soundOn]);

  function toggleSound() {
    const next = !soundOn;
    setSound(next);
    setSoundOn(next);
    writeLocal("bridge:sound", next);
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      audio.volume = 0.85;
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }

  if (gone) return null;

  return (
    <div
      className="intro"
      data-phase={phase}
      data-complete={complete ? "true" : "false"}
      role="status"
      aria-live="polite"
      aria-label="مقدمة جسر التحول"
    >
      <div className="intro__bg" aria-hidden />
      <div className="intro__grain" aria-hidden />

      <audio ref={audioRef} src="/sound/anthem.mp3" preload="auto" playsInline />

      <div className="intro__controls">
        <button type="button" className="intro__btn" onClick={toggleSound} aria-pressed={soundOn}>
          {soundOn ? "كتم الصوت" : "تشغيل الصوت"}
        </button>
        <button type="button" className="intro__btn" onClick={dismiss}>
          تخطٍّ
        </button>
      </div>

      <div className="intro__stage" aria-hidden>
        <div className="intro__layer intro__layer--old">
          <div className="intro__crop intro__crop--old-symbol">
            {/* eslint-disable-next-line @next/next/no-img-element -- علامة SVG ثابتة داخل مشهد متحرّك */}
            <img src="/brand/moh-mark.svg" alt="" draggable={false} />
          </div>
          <div className="intro__crop intro__crop--old-word">
            {/* eslint-disable-next-line @next/next/no-img-element -- علامة SVG ثابتة داخل مشهد متحرّك */}
            <img src="/brand/moh-mark.svg" alt="" draggable={false} />
          </div>
        </div>

        <svg className="intro__geo" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <defs>
            <filter id="introSoft" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="introCore" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" result="b1" />
              <feGaussianBlur stdDeviation="3" result="b2" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="introGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a69b62" />
              <stop offset=".5" stopColor="#d3c88a" />
              <stop offset="1" stopColor="#5fcfd0" />
            </linearGradient>
            <linearGradient id="introGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#009b72" />
              <stop offset=".55" stopColor="#27c3a4" />
              <stop offset="1" stopColor="#59c8ef" />
            </linearGradient>
            <linearGradient id="introPetal" x1=".25" y1="0" x2=".75" y2="1">
              <stop offset="0" stopColor="#35c6a7" />
              <stop offset=".45" stopColor="#57d6de" />
              <stop offset="1" stopColor="#edf8ff" />
            </linearGradient>
            <radialGradient id="introCoreFill">
              <stop offset="0" stopColor="#f8ffff" stopOpacity="1" />
              <stop offset=".22" stopColor="#79e0db" stopOpacity=".95" />
              <stop offset=".58" stopColor="#26a9d8" stopOpacity=".48" />
              <stop offset="1" stopColor="#26a9d8" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="intro__guides">
            <circle className="intro__guide intro__guide--1" cx="500" cy="333" r="72" />
            <circle className="intro__guide intro__guide--2" cx="500" cy="333" r="126" />
            <circle className="intro__guide intro__guide--3" cx="500" cy="333" r="188" />
            <path className="intro__axis" d="M500 112V566M275 333H725" />
          </g>

          <g className="intro__bridge" filter="url(#introSoft)">
            <path className="intro__path intro__path--gold" pathLength="1" d="M248 360 C330 285, 405 304, 500 333 C595 362, 666 421, 744 349" />
            <path className="intro__path intro__path--green" pathLength="1" d="M255 315 C350 400, 424 405, 500 333 C580 258, 655 260, 748 332" />
            <path className="intro__echo intro__echo--1" pathLength="1" d="M300 378 C382 438, 445 407, 500 333 C552 263, 618 236, 706 288" />
            <path className="intro__echo intro__echo--2" pathLength="1" d="M292 288 C378 245, 445 266, 500 333 C560 404, 626 431, 716 384" />
          </g>

          <g className="intro__core" filter="url(#introCore)">
            <circle className="intro__halo" cx="500" cy="333" r="78" fill="url(#introCoreFill)" />
            <circle className="intro__ring intro__ring--outer" cx="500" cy="333" r="55" />
            <circle className="intro__ring intro__ring--inner" cx="500" cy="333" r="37" />
            <circle className="intro__dot" cx="500" cy="333" r="4" />
          </g>

          <g className="intro__petals" filter="url(#introSoft)">
            <path className="intro__petal intro__petal--1" pathLength="1" d="M500 333 C467 278 466 225 500 168 C534 225 533 278 500 333 Z" />
            <path className="intro__petal intro__petal--2" pathLength="1" d="M500 333 C549 288 605 282 666 309 C627 362 574 375 500 333 Z" />
            <path className="intro__petal intro__petal--3" pathLength="1" d="M500 333 C562 344 598 388 600 453 C536 450 496 409 500 333 Z" />
            <path className="intro__petal intro__petal--4" pathLength="1" d="M500 333 C504 409 464 450 400 453 C402 388 438 344 500 333 Z" />
            <path className="intro__petal intro__petal--5" pathLength="1" d="M500 333 C426 375 373 362 334 309 C395 282 451 288 500 333 Z" />
          </g>

          <g className="intro__nodes">
            <circle className="intro__node" cx="500" cy="168" r="3" />
            <circle className="intro__node" cx="666" cy="309" r="3" />
            <circle className="intro__node" cx="600" cy="453" r="3" />
            <circle className="intro__node" cx="400" cy="453" r="3" />
            <circle className="intro__node" cx="334" cy="309" r="3" />
          </g>
        </svg>

        <div className="intro__layer intro__layer--new">
          <div className="intro__crop intro__crop--new-symbol">
            <div className="intro__reveal-symbol">
              {/* eslint-disable-next-line @next/next/no-img-element -- علامة SVG ثابتة داخل مشهد متحرّك */}
              <img src="/brand/hh-mark.svg" alt="" draggable={false} />
            </div>
          </div>
          <div className="intro__crop intro__crop--new-word">
            <div className="intro__reveal-word">
              {/* eslint-disable-next-line @next/next/no-img-element -- علامة SVG ثابتة داخل مشهد متحرّك */}
              <img src="/brand/hh-mark.svg" alt="" draggable={false} />
            </div>
          </div>
        </div>
      </div>

      <p className="intro__promise">{STRINGS.motto}</p>
    </div>
  );
}
