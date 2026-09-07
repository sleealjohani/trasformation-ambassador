import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

/** هيكل عظمي لا دوّارة */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("motion-safe:animate-pulse rounded-button bg-panel-2", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="جارٍ التحميل" className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ text, icon = "issues" }: { text: string; icon?: IconName }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-panel px-4 py-10 text-center">
      <span className="inline-flex size-11 items-center justify-center rounded-icon bg-tint text-hh-2736">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-body text-muted">{text}</p>
    </div>
  );
}

export function ErrorState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-card border border-hh-072 bg-status-escalated-tint p-4">
      <p className="flex items-center gap-2 text-body text-hh-072">
        <Icon name="escalate" size={16} />
        <span>{text}</span>
      </p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          <Icon name="retry" size={16} />
          <span>إعادة المحاولة</span>
        </Button>
      ) : null}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <p role="status" className="flex items-center gap-2 rounded-card border border-line bg-status-waiting-tint p-3 text-secondary text-hh-3145">
      <Icon name="clock" size={16} />
      <span>لا يوجد اتصال. حفظنا ما كتبت وسنرسله عند عودة الشبكة.</span>
    </p>
  );
}
