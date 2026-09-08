export type ControlSnapshot = {
  generatedAt: string;
  storageConfigured: boolean;
  kpis: {
    submissionsTotal: number;
    submissions7d: number;
    needsReading: number;
    overdue: number;
    answered: number;
    issuesOpen: number;
    issuesReview: number;
    rumorsWaiting: number;
    unansweredFaqs: number;
    publishedMedia: number;
    clarityIndex: number | null;
    claritySample: number;
  };
  topTopics: Array<{ key: string; label: string; count: number }>;
  heatmap: {
    days: string[];
    topics: Array<{ key: string; label: string }>;
    cells: Array<{ day: string; topic: string; count: number }>;
    max: number;
  };
  trend: Array<{ day: string; count: number }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string | null;
    source: string | null;
    topic: string;
    topicLabel: string;
    status: string;
    interestCount: number;
    updatedAt: string;
  }>;
  knowledge: Array<{
    id: string;
    kind: string;
    title: string;
    body: string;
    source: string;
    sort: number;
    effectiveDate: string | null;
    updatedAt: string;
  }>;
  journey: Array<{
    id: string;
    sort: number;
    title: string;
    state: string;
    whatHappens: string;
    employeeAction: string;
    openQuestions: string[];
  }>;
  media: Array<{
    id: string;
    slug: string;
    title: string;
    sourceLabel: string;
    sourceUrl: string | null;
    mediaUrl: string;
    storagePath: string | null;
    published: boolean;
    sort: number;
    updatedAt: string;
  }>;
  audit: Array<{ id: string; action: string; entity: string; entityId: string | null; at: string }>;
};

export type ControlSnapshotSetter = (snapshot: ControlSnapshot) => void;
export type AdminTopic = { slug: string; label: string };
