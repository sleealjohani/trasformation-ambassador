import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AnswersList } from "@/components/app/AnswersList";
import { listFaqs } from "@/server/faqs";
import { listTopics } from "@/server/topics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الأسئلة والإجابات — جسر التحول", robots: { index: false } };

export default async function AnswersPage() {
  const [items, topics] = await Promise.all([listFaqs(), listTopics()]);
  return (
    <AppShell title="الأسئلة والإجابات" subtitle="أسئلة بناها الموظفون. السؤال بلا إجابة يبقى ظاهرًا بحالته.">
      <AnswersList items={items} topics={topics} />
    </AppShell>
  );
}
