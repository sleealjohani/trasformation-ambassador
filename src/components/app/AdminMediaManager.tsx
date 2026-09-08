"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ApiError, apiSend, errorMessage } from "@/lib/api";
import type { ControlSnapshot, ControlSnapshotSetter } from "./admin-control-types";

type MediaDraft = { id?: string; slug?: string; title: string; sourceLabel: string; sourceUrl: string; mediaUrl: string; storagePath?: string | null; published: boolean; sort: number };
type UploadTicket = { signedUrl: string; publicUrl: string; storagePath: string };
const field = "min-h-11 w-full rounded-button border border-line bg-panel px-3 py-2 text-body text-ink outline-none focus-visible:border-hh-2736";

function draftFor(count: number): MediaDraft {
  return { title: "", sourceLabel: "الصحة القابضة", sourceUrl: "", mediaUrl: "", published: true, sort: count };
}

function mediaError(error: unknown): string {
  if (error instanceof ApiError && error.status === 503) return "الرفع المباشر يحتاج تفعيل مفتاح تخزين Supabase في بيئة النشر. تقدر تضيف فيديو برابط مباشر الآن.";
  return errorMessage(error);
}

export function AdminMediaManager({ snapshot, onSnapshot }: { snapshot: ControlSnapshot; onSnapshot: ControlSnapshotSetter }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<MediaDraft>(() => draftFor(snapshot.media.length));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function save(body: MediaDraft, message: string) {
    setBusy(true); setProgress(null);
    try {
      const next = await apiSend<ControlSnapshot>("/api/admin/control", { action: "media.save", ...body, sourceUrl: body.sourceUrl || null });
      onSnapshot(next); setForm(draftFor(next.media.length)); setProgress(message); return true;
    } catch (error) { setProgress(mediaError(error)); return false; }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    if (!snapshot.storageConfigured) { setProgress("الرفع المباشر مو مفعّل إلى الآن. أضف مفتاح التخزين في Vercel أو استخدم رابط فيديو مباشر."); return; }
    const title = form.title.trim() || file.name.replace(/\.[^.]+$/, "");
    if (!form.sourceLabel.trim()) { setProgress("اكتب مصدر الفيديو أولًا."); return; }
    setBusy(true); setProgress("جاري تجهيز الرفع…");
    try {
      const ticket = await apiSend<UploadTicket>("/api/admin/control", { action: "media.signUpload", fileName: file.name, contentType: file.type, size: file.size });
      setProgress("جاري رفع الفيديو…");
      const uploaded = await fetch(ticket.signedUrl, { method: "PUT", headers: { "content-type": file.type, "cache-control": "3600" }, body: file });
      if (!uploaded.ok) throw new Error(`upload_${uploaded.status}`);
      setProgress("جاري حفظه في المختصرات…");
      const next = await apiSend<ControlSnapshot>("/api/admin/control", { action: "media.save", title, sourceLabel: form.sourceLabel, sourceUrl: form.sourceUrl || null, mediaUrl: ticket.publicUrl, storagePath: ticket.storagePath, published: form.published, sort: form.sort });
      onSnapshot(next); setForm(draftFor(next.media.length)); setProgress("تم رفع الفيديو وحفظه في المختصرات.");
      if (fileRef.current) fileRef.current.value = "";
    } catch (error) { setProgress(mediaError(error)); }
    finally { setBusy(false); }
  }

  async function updateRow(item: ControlSnapshot["media"][number], patch: Partial<MediaDraft>, message: string) {
    await save({ id: item.id, slug: item.slug, title: item.title, sourceLabel: item.sourceLabel, sourceUrl: item.sourceUrl ?? "", mediaUrl: item.mediaUrl, storagePath: item.storagePath, published: item.published, sort: item.sort, ...patch }, message);
  }

  async function remove(id: string) {
    if (!window.confirm("تحذف الفيديو من قائمة المختصرات؟")) return;
    setBusy(true); setProgress(null);
    try { const next = await apiSend<ControlSnapshot>("/api/admin/control", { action: "entity.delete", entity: "media", id }); onSnapshot(next); setProgress("تم حذف الفيديو من القائمة."); }
    catch (error) { setProgress(mediaError(error)); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-5 xl:grid-cols-[minmax(330px,0.82fr)_minmax(0,1.5fr)]">
    <section className="surface-raise flex h-fit flex-col gap-4 rounded-card p-4 xl:sticky xl:top-4">
      <div><div className="flex items-center justify-between gap-3"><h2 className="text-card-title font-bold text-ink">{form.id ? "تعديل فيديو" : "إضافة للمختصرات"}</h2><span className={snapshot.storageConfigured ? "rounded-tag bg-status-answered-tint px-2 py-1 text-tag font-bold text-hh-2736" : "rounded-tag bg-status-waiting-tint px-2 py-1 text-tag font-bold text-hh-3145"}>{snapshot.storageConfigured ? "الرفع جاهز" : "الرفع يحتاج تفعيل"}</span></div><p className="mt-1 text-secondary text-muted">ارفع MP4/WebM/MOV حتى 100MB، أو حط رابط فيديو مباشر.</p></div>
      <label className="text-secondary font-bold text-ink-soft">عنوان الفيديو<input className={`${field} mt-1`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثلاً: وش يصير على سنوات خدمتي؟" /></label>
      <label className="text-secondary font-bold text-ink-soft">المصدر<input className={`${field} mt-1`} value={form.sourceLabel} onChange={(e) => setForm({ ...form, sourceLabel: e.target.value })} /></label>
      <label className="text-secondary font-bold text-ink-soft">رابط المصدر — اختياري<input className={`${field} mt-1`} value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://…" /></label>
      <div className="rounded-card border border-dashed border-line-strong bg-panel-2 p-4 text-center"><input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden disabled={!snapshot.storageConfigured || busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} /><button type="button" disabled={!snapshot.storageConfigured || busy} onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-button bg-hh-2736 px-4 font-bold text-panel disabled:opacity-50"><Icon name="video" size={17} />رفع فيديو من الجهاز</button><p className="mt-2 text-tag text-muted">يروح مباشرة لتخزين Supabase، مو عبر خادم الموقع.</p></div>
      <div className="flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-tag text-faint">أو</span><span className="h-px flex-1 bg-line" /></div>
      <label className="text-secondary font-bold text-ink-soft">رابط/مسار الفيديو<input className={`${field} mt-1`} value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://…/video.mp4 أو /media/video.mp4" /></label>
      <div className="grid grid-cols-2 gap-2"><label className="text-secondary font-bold text-ink-soft">الترتيب<input type="number" min={0} className={`${field} mt-1`} value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} /></label><label className="flex min-h-16 items-center gap-2 rounded-button border border-line bg-panel px-3 text-secondary font-bold text-ink-soft"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />منشور للموظفين</label></div>
      <Button disabled={busy || !form.title.trim() || !form.sourceLabel.trim() || !form.mediaUrl.trim()} onClick={() => void save(form, form.id ? "تم تحديث الفيديو." : "تمت إضافة الفيديو.")}>{form.id ? "حفظ التعديل" : "إضافة بالرابط"}</Button>
      {form.id ? <Button variant="ghost" onClick={() => setForm(draftFor(snapshot.media.length))}>إلغاء التعديل</Button> : null}
      {progress ? <p role="status" className="rounded-button bg-panel-2 p-3 text-secondary text-ink-soft">{progress}</p> : null}
    </section>

    <section className="flex min-w-0 flex-col gap-3"><div><h2 className="text-card-title font-bold text-ink">قائمة المختصرات</h2><p className="text-secondary text-muted">غيّر الترتيب، اخفِ أي مقطع، أو عدّل بياناته بدون نشر كود جديد.</p></div>
      <div className="grid gap-3 lg:grid-cols-2">{snapshot.media.map((item, index) => <article key={item.id} className="overflow-hidden rounded-card border border-line bg-panel"><div className="aspect-[9/12] max-h-[340px] bg-black"><video src={item.mediaUrl} className="h-full w-full object-cover" muted controls playsInline preload="metadata" /></div><div className="flex flex-col gap-3 p-4"><div><div className="flex items-start justify-between gap-3"><h3 className="text-body font-bold text-ink">{item.title}</h3><span className={item.published ? "shrink-0 rounded-tag bg-status-answered-tint px-2 py-1 text-tag font-bold text-hh-2736" : "shrink-0 rounded-tag bg-panel-2 px-2 py-1 text-tag text-muted"}>{item.published ? "منشور" : "مخفي"}</span></div><p className="mt-1 text-tag text-muted">{item.sourceLabel} · ترتيب {item.sort}</p></div><div className="flex flex-wrap gap-1"><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-2736 hover:bg-tint" onClick={() => setForm({ id: item.id, slug: item.slug, title: item.title, sourceLabel: item.sourceLabel, sourceUrl: item.sourceUrl ?? "", mediaUrl: item.mediaUrl, storagePath: item.storagePath, published: item.published, sort: item.sort })}>تعديل</button><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-2736 hover:bg-tint" onClick={() => void updateRow(item, { published: !item.published }, item.published ? "تم إخفاء الفيديو." : "تم نشر الفيديو.")}>{item.published ? "إخفاء" : "نشر"}</button><button type="button" disabled={index === 0} className="min-h-11 rounded-tag px-3 text-secondary text-ink-soft disabled:opacity-40" onClick={() => void updateRow(item, { sort: Math.max(0, item.sort - 1) }, "تم تغيير الترتيب.")}>↑</button><button type="button" disabled={index === snapshot.media.length - 1} className="min-h-11 rounded-tag px-3 text-secondary text-ink-soft disabled:opacity-40" onClick={() => void updateRow(item, { sort: item.sort + 1 }, "تم تغيير الترتيب.")}>↓</button><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-072 hover:bg-status-escalated-tint" onClick={() => void remove(item.id)}>حذف</button></div></div></article>)}</div>
    </section>
  </div>;
}
