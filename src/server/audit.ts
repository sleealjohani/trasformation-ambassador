import { db } from "../../db/client";
import { auditLog } from "../../db/schema";

export type ActorRole = "employee" | "ambassador" | "system";

/** إلحاقي فقط. لا يُكتب فيه أي نص خام ولا أي معرّف جهاز. */
export async function audit(input: {
  actorRole: ActorRole;
  action: string;
  entity: string;
  entityId?: string | null | undefined;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  await db.insert(auditLog).values({
    actorRole: input.actorRole,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
  });
}
