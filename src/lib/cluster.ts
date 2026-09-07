import { jaccard, stemSet } from "./text";

/** عتبة الدمج في قضية قائمة */
export const CLUSTER_THRESHOLD = 0.6;

export type ClusterCandidate = { id: string; titleNorm: string };

export type ClusterMatch = { id: string; similarity: number } | null;

/**
 * يبحث عن أقرب قضية قائمة. ≥ ٠٫٦ ⟶ دمج، وإلا قضية جديدة تُعرض في اللوحة للمراجعة.
 * `titleNorm` هو نص الجذوع المفصول بمسافات كما تخزّنه `toClusterKey`.
 */
export function findCluster(text: string, candidates: readonly ClusterCandidate[]): ClusterMatch {
  const set = stemSet(text);
  let best: ClusterMatch = null;
  for (const c of candidates) {
    const other = new Set(c.titleNorm.split(" ").filter(Boolean));
    const similarity = jaccard(set, other);
    if (similarity >= CLUSTER_THRESHOLD && (best === null || similarity > best.similarity)) {
      best = { id: c.id, similarity };
    }
  }
  return best;
}

export function toClusterKey(text: string): string {
  return [...stemSet(text)].sort().join(" ");
}
