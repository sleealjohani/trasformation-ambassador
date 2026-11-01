"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CARD, CARD_KINDS, CARD_KIND_LABELS, type CardKind } from "@/content/card";
import { STRINGS } from "@/content/strings";
import { apiSend, errorMessage } from "@/lib/api";
import { redact } from "@/lib/redact";
import { CODES_KEY, readLocal, writeLocal } from "@/lib/storage";

const KIND_ICON: Record<CardKind, IconName> = { question: "question", concern: "concern", challenge: "challenge", idea: "idea", rumor: "rumor" };

type Done = { refCode: string; redacted: boolean };

export function CardForm() {
  const [kind, setKind] = useState<CardKind | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);
  const doneTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (done) doneTitle.current?.focus(); }, [done]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (body.trim().length < 3) { setError(CARD.tooShort); return; }
    setSending(true); setError(null);
    // التنقية الأولى على الجهاز: لا يغادر الجهاز إلا النص المنقّى (والخادم ينقّيه مرة ثانية)
    const cleaned = redact(body);
    try {
      const result = await apiSend<{ refCode: string }>("/api/card", { kind, body: cleaned.clean });
      const codes = readLocal<string[]>(CODES_KEY) ?? [];
      writeLocal(CODES_KEY, [result.refCode, ...codes].slice(0, 20));
      setDone({ refCode: result.refCode, redacted: cleaned.hits.length > 0 });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function again() {
    setDone(null); setBody(""); setKind(null); setCopied(false); setError(null);
  }

  async function copy() {
    if (!done) return;
    try { await navigator.clipboard.writeText(done.refCode); setCopied(true); } catch { setCopied(false); }
  }

  if (done) {
    return (
      <div className="qcard-done" role="status" aria-live="polite">
        <span className="qcard-done-mark" aria-hidden="true"><Icon name="check" size={30} /></span>
        <h2 ref={doneTitle} tabIndex={-1} className="qcard-done-title">{CARD.doneTitle}</h2>
        <p className="qcard-done-body">{CARD.doneBody}</p>
        {done.redacted ? <p className="qcard-done-note"><Icon name="eye" size={16} />{STRINGS.redactionNotice}</p> : null}
        <div className="qcard-code">
          <span className="qcard-code-label">{CARD.doneCodeLabel}</span>
          <div className="qcard-code-row">
            <bdi dir="ltr" className="qcard-code-value" data-testid="ref-code">{done.refCode}</bdi>
            <button type="button" className="qcard-code-copy" onClick={() => void copy()}><Icon name="copy" size={16} />{copied ? "نُسخ" : "انسخ"}</button>
          </div>
        </div>
        <div className="qcard-done-actions">
          <a className="qcard-btn qcard-btn--primary" href={`/track?code=${encodeURIComponent(done.refCode)}`}>{CARD.doneTrack}</a>
          <button type="button" className="qcard-btn qcard-btn--quiet" onClick={again}>{CARD.doneAgain}</button>
        </div>
      </div>
    );
  }

  return (
    <form className="qcard-formbody" onSubmit={(e) => void submit(e)} noValidate>
      <div className="qcard-tagrow">
        <span className="qcard-pill"><Icon name="lock" size={15} />{CARD.formTag}</span>
        <span className="qcard-mark">{CARD.eyebrow}<svg viewBox="-2 -10 442 254" aria-hidden="true"><path d="M0 206C94 206 92 0 214 0S344 206 438 206" /></svg></span>
      </div>

      <h2 className="qcard-title">{CARD.formTitle}</h2>
      <p className="qcard-formsub">{CARD.formSub}</p>

      <fieldset className="qcard-kinds">
        <legend className="qcard-label"><span className="qcard-num" aria-hidden="true">١</span>{CARD.kindLabel} <small>{CARD.kindOptional}</small></legend>
        <div className="qcard-chips">
          {CARD_KINDS.map((k) => (
            <label key={k} className="qcard-chip">
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
              <span className="qcard-box" aria-hidden="true"><Icon name="check" size={13} /></span>
              <Icon name={KIND_ICON[k]} size={17} />
              <span>{CARD_KIND_LABELS[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="qcard-label" htmlFor="qcard-body"><span className="qcard-num" aria-hidden="true">٢</span>{CARD.bodyLabel}</label>
      <textarea id="qcard-body" className="qcard-lines" rows={6} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} aria-describedby="qcard-reassure" autoComplete="off" />

      <p id="qcard-reassure" className="qcard-reassure"><svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 5 6.2v5.3c0 4 2.9 7.3 7 9 4.1-1.7 7-5 7-9V6.2ZM9 12l2 2 4-4" /></svg><span>{CARD.reassurance}</span></p>

      {error ? <p role="alert" className="qcard-error">{error}</p> : null}

      <button type="submit" className="qcard-btn qcard-btn--primary qcard-submit" disabled={sending}>
        <Icon name="send" size={18} />{sending ? CARD.sending : CARD.submit}
      </button>
    </form>
  );
}
