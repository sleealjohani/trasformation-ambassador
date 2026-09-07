"use client";

import { useState } from "react";
import { IssueCard } from "@/components/ui/IssueCard";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { ApiError, apiSend, errorMessage } from "@/lib/api";
import type { VisibleStatus } from "@/lib/state";

export type IssueItem = {
  id: string;
  title: string;
  topicLabel: string;
  weight: number;
  status: string;
  answer: string | null;
  answerSource: string | null;
  voted: boolean;
};

function toStatus(status: string): VisibleStatus {
  if (status === "answered") return "answered";
  if (status === "referred") return "referred";
  if (status === "waiting") return "waiting";
  return "new";
}

export function IssuesList({ initial }: { initial: IssueItem[] }) {
  const [issues, setIssues] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function vote(id: string) {
    setError(null);
    // تحديث متفائل مع تراجع عند الفشل
    setIssues((rows) => rows.map((r) => (r.id === id ? { ...r, voted: true, weight: r.weight + 1 } : r)));
    try {
      const { weight } = await apiSend<{ weight: number }>(`/api/issues/${id}/vote`, {});
      setIssues((rows) => rows.map((r) => (r.id === id ? { ...r, weight } : r)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) return; // صوّت سابقًا: نُبقي الحالة
      setIssues((rows) => rows.map((r) => (r.id === id ? { ...r, voted: false, weight: r.weight - 1 } : r)));
      setError(errorMessage(err));
    }
  }

  if (issues.length === 0) return <EmptyState text={STRINGS.emptyIssues} />;

  return (
    <div className="flex flex-col gap-3">
      {error ? <ErrorState text={error} /> : null}
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          title={issue.title}
          topic={issue.topicLabel}
          status={toStatus(issue.status)}
          interestedCount={issue.weight}
          voted={issue.voted}
          onVote={() => void vote(issue.id)}
          {...(issue.answer ? { answer: issue.answer } : {})}
          {...(issue.answerSource ? { answerSource: issue.answerSource } : {})}
        />
      ))}
    </div>
  );
}
