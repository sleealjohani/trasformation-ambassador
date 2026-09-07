import { asc } from "drizzle-orm";
import { db } from "../../db/client";
import { journeyStages } from "../../db/schema";

export type JourneyStage = {
  id: string;
  sort: number;
  title: string;
  state: "done" | "current" | "upcoming";
  whatHappens: string;
  employeeAction: string;
  openQuestions: string[];
};

export async function listJourney(): Promise<JourneyStage[]> {
  const rows = await db.select().from(journeyStages).orderBy(asc(journeyStages.sort));
  return rows.map((r) => ({ ...r, state: r.state as JourneyStage["state"] }));
}
