import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { pulseResponses, pulseWeeks } from "../../db/schema";
import { PULSE_MIN_SAMPLE, clarityIndex, isoWeek } from "@/lib/ranking";
import { redact } from "@/lib/redact";
import { audit } from "./audit";
import { hashDevice } from "./device";

export type PulseWeekView = { week: string; clarityIndex: number | null; sample: number; published: boolean };

export class AlreadyAnswered extends Error {
  constructor() {
    super("already_answered");
  }
}

async function recompute(week: string): Promise<PulseWeekView> {
  const [agg] = await db
    .select({ avg: sql<string | null>`avg(${pulseResponses.clarity})`, n: sql<number>`count(*)::int` })
    .from(pulseResponses)
    .where(eq(pulseResponses.week, week));
  const sample = agg?.n ?? 0;
  const published = sample >= PULSE_MIN_SAMPLE;
  const index = agg?.avg ? clarityIndex(Number(agg.avg)) : null;
  await db
    .insert(pulseWeeks)
    .values({ week, clarityIndex: index === null ? null : String(index), sample, published, updatedAt: new Date() })
    .onConflictDoUpdate({ target: pulseWeeks.week, set: { clarityIndex: index === null ? null : String(index), sample, published, updatedAt: new Date() } });
  return { week, clarityIndex: published ? index : null, sample, published };
}

export async function submitPulse(input: { clarity: number; oneThing?: string | undefined; deviceHash: string }): Promise<PulseWeekView> {
  const week = isoWeek(new Date());
  const device = hashDevice(input.deviceHash);
  const [existing] = await db.select({ id: pulseResponses.id }).from(pulseResponses).where(sql`${pulseResponses.week} = ${week} and ${pulseResponses.deviceHash} = ${device}`);
  if (existing) throw new AlreadyAnswered();

  await db.insert(pulseResponses).values({
    week,
    clarity: input.clarity,
    oneThingText: input.oneThing ? redact(input.oneThing).clean : null,
    deviceHash: device,
  });
  const view = await recompute(week);
  await audit({ actorRole: "employee", action: "pulse.answer", entity: "pulse", entityId: week });
  return view;
}

/** ما يراه الموظف هو ما تراه الإدارة: الأسابيع بمؤشرها، والأسبوع غير المكتمل بلا رقم */
export async function listPulseWeeks(): Promise<PulseWeekView[]> {
  const rows = await db.select().from(pulseWeeks).orderBy(asc(pulseWeeks.week));
  const current = isoWeek(new Date());
  if (!rows.some((r) => r.week === current)) rows.push({ week: current, clarityIndex: null, sample: 0, published: false, updatedAt: new Date() });
  return rows.map((r) => ({
    week: r.week,
    clarityIndex: r.published && r.clarityIndex !== null ? Number(r.clarityIndex) : null,
    sample: r.sample,
    published: r.published,
  }));
}

export async function currentWeek(): Promise<string> {
  return isoWeek(new Date());
}
