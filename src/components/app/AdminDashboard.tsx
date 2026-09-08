"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { StatusTag } from "@/components/ui/StatusTag";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui/States";
import { toArabicDigits } from "@/lib/numerals";
import { toVisibleStatus, type SubmissionState } from "@/lib/state";
import { ApiError, apiGet, apiSend, errorMessage } from "@/lib/api";

type InboxRow = {
  id: string;
  gate: string;
  type: string;
  topic: string | null;
  bodyClean: string | null;
  answersClean: Record<string, string> | null;
  urgency: number;
  sentiment: string | null;
  needsReading: boolean;
  status: string;
  issueId: string | null;
  issueTitle: string | null;
  similarCount: number;
  slaDueAt: string | null;
  overdue: boolean;
  createdAt: string;
  score: number;
};

type IssueRow = { id: string; title: string; topic: string; topicLabel: string; weight: number; status: string; needsReview: boolean; answerId: string | null };
type RumorRow = { id: string; claim: string; count: number; verdict: string; officialText: string | null; needsReview: boolean; needsEscalation: boolean; overdue: boolean };
type Report = { text: string; week: string };
type Topic = { slug: string; label: string };

type Tab = "inbox" | "issues" | "rumors" | "report";

const TYPES = [
  { value: "question", label: "سؤال" },
  { value: "concern", label: "مخاوف" },
  { value: "challenge", label: "تحدٍّ" },
  { value: "idea", label: "اقتراح" },
] as const;

function fmt(iso: string): string {
  return toArabicDigits(new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)));
}

export function AdminDashboard({ topics, initialInbox, initialIssues }: { topics: Topic[]; initialInbox: InboxRow[]; initialIssues: IssueRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("inbox");
  const [inbox, setInbox] = useState<InboxRow[] | null>(initialInbox);
  const [issues, setIssues] = useState<IssueRow[]>(initialIssues);
  const [rumors, setRumors] = useState<RumorRow[] | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<InboxRow | null>(null);
  const [activeIssue, setActiveIssue] = useState<IssueRow | null>(null);
  const [activeRumor, setActiveRumor] = useState<RumorRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    await Promise.resolve();
    setError(null);
    try {
      const [i, s] = await Promise.all([apiGet<InboxRow[]>("/api/admin/inbox"), apiGet<IssueRow[]>("/api/admin/issues")]);
      setInbox(i);
      setIssues(s);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError(errorMessage(err));
      setInbox([]);
    }
  }, [router]);

  async function act<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
      setActive(null);
      setActiveIssue(null);
      setActiveRumor(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function openRumors() {
    setTab("rumors");
    if (rumors === null) {
      try {
        setRumors(await apiGet<RumorRow[]>("/api/admin/rumors"));
      } catch (err) {
        setError(errorMessage(err));
        setRumors([]);
      }
    }
  }

  async function buildReport() {
    setTab("report");
    setBusy(true);
    try {
      setReport(await apiGet<Report>("/api/admin/report/weekly"));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const overdue = (inbox ?? []).filter((r) => r.overdue);
  const needsReading = (inbox ?? []).filter((r) => r.needsReading);

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="أقسام اللوحة" className="flex gap-2 overflow-x-auto">
        {([
          ["inbox", "الوارد"],
          ["issues", "القضايا"],
          ["rumors", "الشائعات"],
          ["report", "تقرير الأسبوع"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-current={tab === key ? "page" : undefined}
            onClick={() => (key === "rumors" ? void openRumors() : key === "report" ? void buildReport() : setTab(key))}
            className={
              tab === key
                ? "inline-flex min-h-11 shrink-0 items-center rounded-tag border border-hh-2736 bg-tint px-4 text-secondary font-bold text-hh-2736 transition-all duration-[180ms] ease-brand"
                : "inline-flex min-h-11 shrink-0 items-center rounded-tag border border-line bg-panel px-4 text-secondary text-ink-soft transition-all duration-[180ms] ease-brand hover:border-line-strong hover:bg-panel-2 active:scale-95"
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {error ? <ErrorState text={error} onRetry={() => void load()} /> : null}

      {tab === "inbox" ? (
        inbox === null ? (
          <SkeletonList count={3} />
        ) : inbox.length === 0 ? (
          <EmptyState text="لا مشاركات في الوارد." />
        ) : (
          <div className="flex flex-col gap-4">
            {overdue.length > 0 ? (
              <section aria-labelledby="overdue" className="rise flex flex-col gap-2 rounded-card border border-hh-072 bg-status-escalated-tint p-4">
                <h2 id="overdue" className="flex items-center gap-2 text-card-title font-bold text-hh-072">
                  <Icon name="escalate" size={16} />
                  <span>متأخرات ({toArabicDigits(overdue.length)})</span>
                </h2>
                <ul className="flex flex-col gap-1">
                  {overdue.slice(0, 5).map((r) => (
                    <li key={r.id} className="text-secondary text-hh-072">
                      {r.issueTitle ?? r.bodyClean?.slice(0, 60) ?? "—"}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {needsReading.length > 0 ? (
              <p className="rounded-card border border-line bg-status-waiting-tint p-3 text-secondary text-hh-3145">
                {toArabicDigits(needsReading.length)} مشاركة في صندوق «يحتاج قراءة» — ثقة التصنيف دون ٠٫٦.
              </p>
            ) : null}

            <ul className="flex flex-col gap-3">
              {inbox.map((row, i) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setActive(row)}
                    className="rise lift surface-raise flex w-full flex-col gap-2 rounded-card p-4 text-start"
                    style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-body font-bold text-ink">{row.bodyClean ?? "— حُذف النص بطلب المرسل —"}</span>
                      <StatusTag status={toVisibleStatus(row.status as SubmissionState, row.overdue)} />
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-secondary text-muted">
                      <span>إلحاح {toArabicDigits(Math.round(row.score * 100))}٪</span>
                      <span>{topics.find((t) => t.slug === row.topic)?.label ?? "بلا تصنيف"}</span>
                      <span>{toArabicDigits(row.similarCount)} مشابهة</span>
                      <span>{fmt(row.createdAt)}</span>
                      {row.needsReading ? <span className="text-hh-3145">يحتاج قراءة</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}

      {tab === "issues" ? (
        <ul className="flex flex-col gap-3">
          {issues.map((issue, i) => (
            <li key={issue.id}>
              <button
                type="button"
                onClick={() => setActiveIssue(issue)}
                className="rise lift surface-raise flex w-full flex-col gap-2 rounded-card p-4 text-start"
                style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
              >
                <span className="text-body font-bold text-ink">{issue.title}</span>
                <span className="flex flex-wrap gap-x-3 text-secondary text-muted">
                  <span>{issue.topicLabel}</span>
                  <span>وزن {toArabicDigits(issue.weight)}</span>
                  <span>{issue.status}</span>
                  {issue.needsReview ? <span className="text-hh-3145">قضية جديدة تحتاج مراجعة</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "rumors" ? (
        rumors === null ? (
          <SkeletonList count={2} />
        ) : rumors.length === 0 ? (
          <EmptyState icon="rumor" text="لا شائعات مرصودة." />
        ) : (
          <ul className="flex flex-col gap-3">
            {rumors.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setActiveRumor(r)}
                  className="rise lift surface-raise flex w-full flex-col gap-2 rounded-card p-4 text-start"
                  style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
                >
                  <span className="text-body font-bold text-ink">«{r.claim}»</span>
                  <span className="flex flex-wrap gap-x-3 text-secondary text-muted">
                    <span>وردت {toArabicDigits(r.count)} مرة</span>
                    <span>{r.verdict}</span>
                    {r.needsEscalation ? <span className="text-hh-072">تحتاج تصعيدًا</span> : null}
                    {r.needsReview ? <span className="text-hh-072">تذكر اسمًا — محجوبة</span> : null}
                    {r.overdue ? <span className="text-hh-072">تجاوزت ٤٨ ساعة</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "report" ? (
        <section className="rise surface-raise flex flex-col gap-3 rounded-card p-4">
          <h2 className="text-card-title font-bold text-ink">تقرير الأسبوع</h2>
          {busy && !report ? (
            <SkeletonList count={1} />
          ) : report ? (
            <>
              <pre data-testid="weekly-report" className="whitespace-pre-wrap rounded-button border border-line bg-panel-2 p-3 text-secondary text-ink">
                {report.text}
              </pre>
              <Button
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(report.text).then(() => setCopied(true)).catch(() => setCopied(false));
                }}
              >
                <Icon name={copied ? "check" : "copy"} size={16} />
                <span>{copied ? "نُسخ" : "انسخ التقرير"}</span>
              </Button>
              <p className="text-secondary text-muted">مجمّع فقط — بلا نص خام، ولا تقسيم دون سبع مشاركات.</p>
            </>
          ) : null}
          <Button onClick={() => void buildReport()} disabled={busy}>
            <Icon name="retry" size={16} />
            <span>أعد التوليد</span>
          </Button>
        </section>
      ) : null}

      {active ? <SubmissionSheet row={active} topics={topics} issues={issues} busy={busy} onClose={() => setActive(null)} onAct={act} /> : null}
      {activeIssue ? <IssueSheet issue={activeIssue} busy={busy} onClose={() => setActiveIssue(null)} onAct={act} /> : null}
      {activeRumor ? <RumorSheet rumor={activeRumor} busy={busy} onClose={() => setActiveRumor(null)} onAct={act} /> : null}
    </div>
  );
}

type ActFn = <T>(fn: () => Promise<T>) => Promise<void>;

function SubmissionSheet({ row, topics, issues, busy, onClose, onAct }: { row: InboxRow; topics: Topic[]; issues: IssueRow[]; busy: boolean; onClose: () => void; onAct: ActFn }) {
  const [topic, setTopic] = useState(row.topic ?? "other");
  const [type, setType] = useState(row.type);
  const [urgency, setUrgency] = useState(row.urgency);
  const [issueId, setIssueId] = useState(row.issueId ?? "");
  const [closeKind, setCloseKind] = useState<"out_of_scope" | "redirected">("out_of_scope");
  const [reason, setReason] = useState("");

  return (
    <Sheet open title="إجراءات على المشاركة" onClose={onClose}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pb-4">
        <p className="rounded-button border border-line bg-panel-2 p-3 text-body text-ink">{row.bodyClean ?? "— حُذف النص —"}</p>
        {row.answersClean
          ? Object.entries(row.answersClean).map(([k, v]) => (
              <p key={k} className="text-secondary text-ink-soft">
                {v}
              </p>
            ))
          : null}

        <section className="flex flex-col gap-2">
          <h3 className="text-card-title font-bold text-ink">التصنيف</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Chip key={t.slug} selected={topic === t.slug} onClick={() => setTopic(t.slug)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip key={t.value} selected={type === t.value} onClick={() => setType(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <label htmlFor="urgency" className="text-secondary text-muted">
            الإلحاح: {toArabicDigits(urgency)}
          </label>
          <input id="urgency" type="range" min={1} max={5} value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} className="accent-hh-2736" />
          <Button disabled={busy} onClick={() => void onAct(() => apiSend(`/api/admin/submissions/${row.id}/classify`, { topic, type, urgency }))}>
            احفظ التصنيف
          </Button>
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-4">
          <h3 className="text-card-title font-bold text-ink">الدمج في قضية</h3>
          <select
            aria-label="اختر قضية"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            className="min-h-11 w-full rounded-button border border-line bg-panel px-3 text-body text-ink"
          >
            <option value="">— اختر قضية —</option>
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
          <Button variant="secondary" disabled={busy || !issueId} onClick={() => void onAct(() => apiSend(`/api/admin/submissions/${row.id}/merge`, { issueId }))}>
            <Icon name="merge" size={16} />
            <span>ادمج</span>
          </Button>
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-4">
          <h3 className="text-card-title font-bold text-ink">الإغلاق</h3>
          <div className="flex flex-wrap gap-2">
            <Chip selected={closeKind === "out_of_scope"} onClick={() => setCloseKind("out_of_scope")}>
              خارج النطاق
            </Chip>
            <Chip selected={closeKind === "redirected"} onClick={() => setCloseKind("redirected")}>
              تحويل للقناة الرسمية
            </Chip>
          </div>
          <input
            aria-label="السبب أو القناة المناسبة"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="القناة المناسبة له…"
            className="min-h-11 w-full rounded-button border border-line bg-panel px-3 text-body text-ink"
          />
          <Button variant="secondary" disabled={busy || reason.trim().length < 2} onClick={() => void onAct(() => apiSend(`/api/admin/submissions/${row.id}/close`, { kind: closeKind, reason }))}>
            أغلق بسبب مكتوب
          </Button>
        </section>
      </div>
    </Sheet>
  );
}

function IssueSheet({ issue, busy, onClose, onAct }: { issue: IssueRow; busy: boolean; onClose: () => void; onAct: ActFn }) {
  const [toTeam, setToTeam] = useState("فريق التحول");
  const [questionText, setQuestionText] = useState(issue.title);
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");

  return (
    <Sheet open title={issue.title} onClose={onClose}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pb-4">
        <section className="flex flex-col gap-2">
          <h3 className="text-card-title font-bold text-ink">الإحالة</h3>
          <input aria-label="الجهة" value={toTeam} onChange={(e) => setToTeam(e.target.value)} className="min-h-11 w-full rounded-button border border-line bg-panel px-3 text-body text-ink" />
          <textarea aria-label="نص السؤال المُحال" value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} className="w-full rounded-card border border-line bg-panel p-3 text-body text-ink" />
          <Button disabled={busy} onClick={() => void onAct(() => apiSend(`/api/admin/issues/${issue.id}/escalate`, { toTeam, questionText }))}>
            <Icon name="forward" size={16} />
            <span>أحِل وابدأ عدّاد SLA</span>
          </Button>
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-4">
          <h3 className="text-card-title font-bold text-ink">نشر إجابة معتمدة</h3>
          <textarea aria-label="نص الإجابة" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="w-full rounded-card border border-line bg-panel p-3 text-body text-ink" />
          <input
            aria-label="المصدر"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="المصدر (إلزامي)"
            className="min-h-11 w-full rounded-button border border-line bg-panel px-3 text-body text-ink"
          />
          <p className="text-secondary text-muted">لا تُنشر إجابة بلا مصدر.</p>
          <Button disabled={busy || answer.trim().length < 5 || source.trim().length < 2} onClick={() => void onAct(() => apiSend("/api/admin/answers", { issueId: issue.id, answer, source }))}>
            انشر الإجابة
          </Button>
        </section>
      </div>
    </Sheet>
  );
}

function RumorSheet({ rumor, busy, onClose, onAct }: { rumor: RumorRow; busy: boolean; onClose: () => void; onAct: ActFn }) {
  const [verdict, setVerdict] = useState(rumor.verdict);
  const [officialText, setOfficialText] = useState(rumor.officialText ?? "");

  const options = [
    { value: "waiting", label: "بانتظار توضيح رسمي" },
    { value: "false", label: "غير صحيح" },
    { value: "true", label: "صحيح" },
    { value: "partly", label: "صحيح جزئيًا" },
  ] as const;

  return (
    <Sheet open title="موقف من شائعة" onClose={onClose}>
      <div className="flex flex-col gap-4 pb-4">
        <p className="rounded-button border border-line bg-panel-2 p-3 text-body text-ink">«{rumor.claim}»</p>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <Chip key={o.value} selected={verdict === o.value} onClick={() => setVerdict(o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
        <textarea aria-label="النص الرسمي" value={officialText} onChange={(e) => setOfficialText(e.target.value)} rows={4} className="w-full rounded-card border border-line bg-panel p-3 text-body text-ink" />
        <Button disabled={busy || officialText.trim().length < 5} onClick={() => void onAct(() => apiSend(`/api/admin/rumors/${rumor.id}/verdict`, { verdict, officialText }))}>
          اعتمد وانشر
        </Button>
      </div>
    </Sheet>
  );
}
