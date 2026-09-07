import { listJourney } from "@/server/journey";
import { handle, json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json(await listJourney()));
}
