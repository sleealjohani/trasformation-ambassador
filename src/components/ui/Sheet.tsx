"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { MOTION } from "@/lib/tokens";
import { cn } from "@/lib/cn";

/** مسافة السحب التي يُغلق بعدها اللوح. */
const DISMISS_THRESHOLD_PX = 80;

type DragState = { startY: number; offset: number };

type SheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** يُستخدم في معرض المكوّنات لعرض اللوح داخل إطار بدل ملء الشاشة. */
  contained?: boolean;
};

/** لوح سفلي — يُغلق بالسحب لأسفل وبالزر معًا، وبمفتاح Escape. */
export function Sheet({ open, ...rest }: SheetProps) {
  // اللوح يُركَّب عند الفتح فقط، فتعود حالة السحب إلى الصفر في كل مرة.
  return open ? <SheetPanel {...rest} /> : null;
}

function SheetPanel({ title, onClose, children, contained = false }: Omit<SheetProps, "open">) {
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const endDrag = () => {
    if (drag && drag.offset > DISMISS_THRESHOLD_PX) onClose();
    setDrag(null);
  };

  return (
    <div
      className={cn(
        "z-10 flex items-end justify-center",
        contained ? "absolute inset-0" : "fixed inset-0",
      )}
    >
      <button
        type="button"
        aria-label="إغلاق اللوح"
        onClick={onClose}
        className="absolute inset-0 min-h-0 min-w-0 cursor-default bg-night/40"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          transform: `translateY(${drag?.offset ?? 0}px)`,
          transitionProperty: drag ? "none" : "transform",
          transitionDuration: `${MOTION.exitMs}ms`,
          transitionTimingFunction: MOTION.easing,
        }}
        className="relative w-full max-w-[430px] rounded-t-card border border-line bg-panel pb-4"
      >
        <div
          data-drag-handle
          onPointerDown={(event) => {
            setDrag({ startY: event.clientY, offset: 0 });
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const { clientY } = event;
            setDrag((current) =>
              current ? { ...current, offset: Math.max(0, clientY - current.startY) } : current,
            );
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-grab touch-none items-center justify-center py-3"
        >
          <span className="block h-1 w-10 rounded-tag bg-line-strong" />
        </div>

        <header className="flex items-center justify-between gap-3 px-4 pb-3">
          <h2 className="text-card-title font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex items-center justify-center rounded-button text-muted hover:bg-panel-2 hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="px-4 text-body text-ink">{children}</div>
      </section>
    </div>
  );
}
