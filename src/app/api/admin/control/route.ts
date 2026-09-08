import type { NextRequest } from "next/server";
import { z } from "zod";
import { badRequest, handle, json, requireAdmin, uuidSchema } from "@/server/http";
import { controlCenterSnapshot, createMediaUploadTicket, deleteManaged, importFaqs, MediaStorageNotConfigured, saveFaq, saveJourney, saveKnowledge, saveMedia } from "@/server/control-center";

export const dynamic = "force-dynamic";

const id = uuidSchema.optional();
const faqSchema = z.object({ action: z.literal("faq.save"), id, question: z.string().min(2).max(500), answer: z.string().max(6000).nullable().optional(), source: z.string().max(1000).nullable().optional(), topic: z.string().min(1).max(80) });
const importSchema = z.object({ action: z.literal("faq.import"), rows: z.array(z.object({ question: z.string().min(1).max(500), answer: z.string().max(6000).nullable().optional(), source: z.string().max(1000).nullable().optional(), topic: z.string().max(80).nullable().optional() })).max(250) });
const knowledgeSchema = z.object({ action: z.literal("knowledge.save"), id, kind: z.enum(["known", "unclear", "changed"]), title: z.string().min(2).max(300), body: z.string().min(2).max(6000), source: z.string().min(2).max(1000), sort: z.number().int().min(0).max(9999) });
const journeySchema = z.object({ action: z.literal("journey.save"), id, sort: z.number().int().min(0).max(9999), title: z.string().min(2).max(300), state: z.enum(["done", "current", "upcoming"]), whatHappens: z.string().min(2).max(4000), employeeAction: z.string().min(2).max(4000), openQuestions: z.array(z.string().max(500)).max(20) });
const mediaSchema = z.object({ action: z.literal("media.save"), id, slug: z.string().max(160).nullable().optional(), title: z.string().min(2).max(300), sourceLabel: z.string().min(2).max(300), sourceUrl: z.string().url().max(2000).nullable().optional().or(z.literal("")), mediaUrl: z.string().min(1).max(3000), storagePath: z.string().max(1000).nullable().optional(), published: z.boolean(), sort: z.number().int().min(0).max(9999) });
const deleteSchema = z.object({ action: z.literal("entity.delete"), entity: z.enum(["faq", "knowledge", "journey", "media"]), id: uuidSchema });
const signSchema = z.object({ action: z.literal("media.signUpload"), fileName: z.string().min(1).max(255), contentType: z.enum(["video/mp4", "video/webm", "video/quicktime"]), size: z.number().int().positive().max(104857600) });

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "control.read");
    if (denied) return denied;
    return json(await controlCenterSnapshot());
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "control.write");
    if (denied) return denied;
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return badRequest("invalid_json");
    }
    const action = typeof raw === "object" && raw !== null && "action" in raw ? String((raw as { action?: unknown }).action ?? "") : "";
    try {
      if (action === "faq.save") {
        const parsed = faqSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await saveFaq(parsed.data);
      } else if (action === "faq.import") {
        const parsed = importSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await importFaqs(parsed.data.rows);
      } else if (action === "knowledge.save") {
        const parsed = knowledgeSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await saveKnowledge(parsed.data);
      } else if (action === "journey.save") {
        const parsed = journeySchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await saveJourney(parsed.data);
      } else if (action === "media.save") {
        const parsed = mediaSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await saveMedia({ ...parsed.data, sourceUrl: parsed.data.sourceUrl || null });
      } else if (action === "entity.delete") {
        const parsed = deleteSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        await deleteManaged(parsed.data.entity, parsed.data.id);
      } else if (action === "media.signUpload") {
        const parsed = signSchema.safeParse(raw); if (!parsed.success) return badRequest(parsed.error.flatten());
        return json(await createMediaUploadTicket(parsed.data));
      } else {
        return badRequest("unknown_action");
      }
      return json(await controlCenterSnapshot());
    } catch (error) {
      if (error instanceof MediaStorageNotConfigured) return json({ error: "media_storage_not_configured" }, 503);
      throw error;
    }
  });
}
