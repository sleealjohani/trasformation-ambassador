"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMounted } from "@/lib/client-only";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { StatusTag } from "@/components/ui/StatusTag";
import { ErrorState, SkeletonList } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { ApiError, apiGet, apiSend, errorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/numerals";
import { isValidRefCode, normalizeRefCode } from "@/lib/refcode";
import { CODES_KEY, readLocal } from "@/lib/storage";
import type { VisibleStatus } from "@/lib/state";

type TrackResult = {
  status: VisibleStatus;
  state: string;
  topic: string;
  similarCount: number;
  timeline: Array<{ state: VisibleStatus; at: string; note: string | null }>;
  slaDueAt: string | null;
  overdue: boolean;
  deleted: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return toArabicDigits(new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d));
}

export function TrackPanel() {
  const mounted = useMounted();
  if (!mounted) return <SkeletonList count={1} />;
  return <TrackPanelClient />;
}

function TrackPanelClient() {
  const params = useSearchParams();
  const saved = useMemo(() => readLocal<string[]>(CODES_KEY) ?? [], []);
  const [code, setCode] = useState(() => params.get("code") ?? "");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lookup = useCallback(async (raw: string) => {
    // نؤجل أول تحديث للحالة خطوة، فلا يتتالى الرسم عند الاستدعاء من تأثير
    await Promise.resolve();
    const normalized = normalizeRefCode(raw);
    if (!isValidRefCode(normalized)) {
      setError(STRINGS.wrongCode);
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(await apiGet<TrackResult>(`/api/track/${normalized}`));
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError && err.status === 404 ? STRINGS.wrongCode : errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fromUrl = params.get("code");
  useEffect(() => {
    // جلب عند التركيب: الرمز يصل من الرابط، والنداء يحتاج تلبيد الجهاز فلا يمكن أداؤه على الخادم.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- جلب بيانات لا تزامن حالة
    if (fromUrl) void lookup(fromUrl);
  }, [fromUrl, lookup]);

  async function remove() {
    const normalized = normalizeRefCode(code);
    try {
      await apiSend<{ deleted: boolean }>(`/api/track/${normalized}`, {}, "DELETE");
      setConfirmDelete(false);
      await lookup(normalized);
    } catch (err) {
      setError(errorMessage(err));
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="surface-raise flex flex-col gap-3 rounded-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
      >
        <label htmlFor="code" className="text-card-title font-bold text-ink">
          أدخل رمز المتابعة
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          dir="ltr"
          inputMode="text"
          autoComplete="off"
          maxLength={12}
          placeholder="J7K4M2QP"
          className="code-ltr w-full rounded-button border border-line bg-panel-2 px-4 py-3 text-center text-code tracking-widest text-ink outline-none focus-visible:border-hh-2736"
        />
        <Button type="submit" full disabled={loading}>
          <Icon name="track" size={16} />
          <span>{loading ? "جارٍ البحث…" : "تابع"}</span>
        </Button>
      </form>

      {saved.length > 0 && !result ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-secondary text-muted">رموز محفوظة على هذا الجهاز</h2>
          <div className="flex flex-wrap gap-2">
            {saved.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCode(c);
                  void lookup(c);
                }}
                className="code-ltr inline-flex min-h-11 items-center rounded-tag border border-line bg-panel px-4 text-secondary text-hh-2736 hover:bg-panel-2"
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {loading ? <SkeletonList count={1} /> : null}
      {error ? <ErrorState text={error} /> : null}

      {result ? (
        <section aria-labelledby="status" className="rise surface-raise flex flex-col gap-4 rounded-card p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 id="status" className="text-card-title font-bold text-ink">
              حالة مشاركتك
            </h2>
            <StatusTag status={result.status} />
          </div>

          <p className="text-secondary text-muted">
            التصنيف: {result.topic}
            {result.similarCount > 0 ? ` · ${toArabicDigits(result.similarCount)} مشاركة مشابهة` : " · لا مشاركات مشابهة بعد"}
          </p>

          {result.overdue ? (
            <p role="status" className="rounded-button border border-hh-072 bg-status-escalated-tint p-3 text-secondary text-hh-072">
              {STRINGS.slaBreached}
            </p>
          ) : null}

          {result.deleted ? (
            <p className="rounded-button border border-line bg-panel-2 p-3 text-secondary text-muted">
              حُذف نص مشاركتك بناءً على طلبك. بقي العدّاد المجمّع فقط.
            </p>
          ) : null}

          {/* الخط الزمني: كل خطوة تدخل بعد التي قبلها، والخيط يصل بينها */}
          <ol className="relative flex flex-col gap-4 border-t border-line pt-4">
            <span aria-hidden className="absolute inset-block-start-[1.6rem] bottom-4 inset-inline-start-[14px] w-px bg-line" />
            {result.timeline.map((e, i) => (
              <li key={i} className="rise relative flex items-start gap-3" style={{ "--i": i } as React.CSSProperties}>
                <span className="draw relative z-10 inline-flex size-[30px] shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736 ring-4 ring-panel">
                  <Icon name="check" size={14} />
                </span>
                <span className="flex flex-col gap-1">
                  <StatusTag status={e.state} />
                  <span className="text-secondary text-muted">{formatDate(e.at)}</span>
                  {e.note ? <span className="text-secondary text-ink-soft">{e.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>

          {!result.deleted ? (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              <Icon name="close" size={16} />
              <span>احذف نص مشاركتي</span>
            </Button>
          ) : null}
        </section>
      ) : null}

      <Sheet open={confirmDelete} title="حذف نص المشاركة" onClose={() => setConfirmDelete(false)}>
        <div className="flex flex-col gap-3">
          <p>سيُحذف النص نهائيًا ولا يمكن استرجاعه. يبقى العدّاد المجمّع فقط حتى لا تختفي القضية من التقارير.</p>
          <Button full onClick={() => void remove()}>
            نعم، احذف النص
          </Button>
          <Button variant="ghost" full onClick={() => setConfirmDelete(false)}>
            تراجع
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
