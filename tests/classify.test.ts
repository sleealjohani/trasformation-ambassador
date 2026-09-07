import { describe, expect, it } from "vitest";
import { CONFIDENCE_FLOOR, classifyByRules, getClassifier, registerClassifier, rulesClassifier } from "../src/lib/classify";

describe("التصنيف بالقواعد", () => {
  it("عقد/تجديد ← العقود", () => {
    const c = classifyByRules("هل يتم تجديد عقدي بعد التحول؟", "question");
    expect(c.topic).toBe("contracts");
    expect(c.confidence).toBeGreaterThanOrEqual(CONFIDENCE_FLOOR);
    expect(c.type).toBe("question");
  });

  it("بدل/راتب ← الرواتب", () => {
    expect(classifyByRules("هل تتأثر البدلات والراتب؟", "concern").topic).toBe("salaries");
  });

  it("نقل/تكليف ← النقل", () => {
    expect(classifyByRules("سمعت عن نقل الموظفين وتكليفهم بمنشآت أخرى", "question").topic).toBe("transfer");
  });

  it("نص بلا كلمات مفتاحية ⟶ يحتاج قراءة بلا تصنيف آلي", () => {
    const c = classifyByRules("عندي شيء أبغى أقوله", "idea");
    expect(c.needsReading).toBe(true);
    expect(c.topic).toBeNull();
  });

  it("نص متوزّع على موضوعين بالتساوي ⟶ ثقة دون العتبة", () => {
    const c = classifyByRules("عقدي وراتبي", "question");
    expect(c.confidence).toBeLessThan(CONFIDENCE_FLOOR);
    expect(c.needsReading).toBe(true);
  });

  it("إشارات القلق ترفع الإلحاح والمشاعر", () => {
    const calm = classifyByRules("ما هي آلية تجديد العقود؟", "question");
    const anxious = classifyByRules("خايف على عقدي وقلق ما أدري متى ينتهي", "concern");
    expect(anxious.urgency).toBeGreaterThan(calm.urgency);
    expect(anxious.sentiment).toBe("anxious");
    expect(anxious.urgency).toBeLessThanOrEqual(5);
  });

  it("واجهة المزوّد قابلة للاستبدال دون تغيير المستدعي", async () => {
    registerClassifier({
      classify: async () => ({ type: "idea", topic: "training", subTopic: null, urgency: 1, sentiment: "calm", confidence: 0.9, needsReading: false }),
    });
    expect((await getClassifier().classify("x", "idea")).topic).toBe("training");
    registerClassifier(rulesClassifier);
    expect((await getClassifier().classify("تدريب ودورات", "idea")).topic).toBe("training");
  });
});
