import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTag } from "../src/components/ui/StatusTag";
import { Chip } from "../src/components/ui/Chip";
import { BottomTabs } from "../src/components/ui/BottomTabs";
import { ChatBubble } from "../src/components/ui/ChatBubble";
import { GateCard } from "../src/components/ui/GateCard";
import { IssueCard } from "../src/components/ui/IssueCard";
import { STATUS_KEYS } from "../src/lib/tokens";
import { STRINGS } from "../src/content/strings";

describe("StatusTag", () => { it.each(STATUS_KEYS)("الحالة %s تُنقل بنص لا بلون وحده", (status) => { const { container } = render(<StatusTag status={status} />); const tag = container.querySelector(`[data-status="${status}"]`); expect(tag).not.toBeNull(); expect(tag?.textContent?.trim()).toBe(STRINGS.statusLabels[status]); expect(tag?.querySelector("svg[data-icon]")).not.toBeNull(); }); });
describe("Chip", () => { it("تعلن حالة الاختيار للقارئ الآلي", async () => { render(<Chip selected>مختارة</Chip>); expect(screen.getByRole("button", { name: "مختارة" })).toHaveAttribute("aria-pressed", "true"); }); it("المعطّلة لا تستجيب للنقر", async () => { const onClick = vi.fn(); render(<Chip disabled onClick={onClick}>معطّلة</Chip>); await userEvent.click(screen.getByRole("button", { name: "معطّلة" })); expect(onClick).not.toHaveBeenCalled(); }); });
vi.mock("next/navigation", () => ({ usePathname: () => "/pulse" }));
describe("BottomTabs", () => { it("خمسة عناصر تطبيقية والنشط معلّم بنص وحالة", () => { render(<BottomTabs />); const nav = screen.getByRole("navigation", { name: "التنقل الرئيسي" }); const tabs = within(nav).getAllByRole("link"); expect(tabs).toHaveLength(5); const active = within(nav).getByRole("link", { name: /استطلاع/ }); expect(active).toHaveAttribute("aria-current", "page"); expect(within(nav).getByRole("link", { name: /الرئيسية/ })).not.toHaveAttribute("aria-current"); }); it("مسار التتبّع يُفعّل متابعتي", () => { render(<BottomTabs active="track" />); expect(screen.getByRole("link", { name: /متابعتي/ })).toHaveAttribute("aria-current", "page"); }); });
describe("ChatBubble", () => { it("حالة الكتابة تُعلن كحالة حيّة", () => { render(<ChatBubble side="incoming" typing />); expect(screen.getByRole("status", { name: "جارٍ الكتابة" })).toBeInTheDocument(); }); it("فشل الإرسال يعرض إعادة المحاولة ويستدعيها", async () => { const onRetry = vi.fn(); render(<ChatBubble side="outgoing" failed onRetry={onRetry}>نص</ChatBubble>); await userEvent.click(screen.getByRole("button", { name: /إعادة المحاولة/ })); expect(onRetry).toHaveBeenCalledOnce(); }); });
describe("GateCard", () => { it("تعرض السؤال الافتتاحي الثابت كما هو", () => { render(<GateCard icon="question" title={STRINGS.gateTitles.question} hint={STRINGS.gateOpeners.question} />); expect(screen.getByText(STRINGS.gateOpeners.question)).toBeInTheDocument(); }); });
describe("IssueCard", () => { it("بلا إجابة تعرض النص المعتمد", () => { render(<IssueCard title="عنوان" topic="العقود" status="referred" interestedCount={3} />); expect(screen.getByText(STRINGS.noOfficialInfo)).toBeInTheDocument(); }); it("بعد التصويت لا يمكن التصويت مرة أخرى", async () => { const onVote = vi.fn(); render(<IssueCard title="عنوان" topic="العقود" status="referred" interestedCount={3} voted onVote={onVote} />); const button = screen.getByRole("button", { name: /سُجّل اهتمامك/ }); expect(button).toBeDisabled(); await userEvent.click(button); expect(onVote).not.toHaveBeenCalled(); }); });
