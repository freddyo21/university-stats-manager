import { cn } from "@/lib/utils";
import type { ScoreTone } from "@/types/types";

const toneClasses: Record<ScoreTone, string> = {
  success: "text-success",
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
  error: "text-error",
  info: "text-info", // Nếu thiếu hoặc thừa "accent" ở đây, TS sẽ báo lỗi ngay lập tức!
  accent: "text-accent",
  muted: "text-muted-foreground",
};

export function StatRow({ label, value, tone }: { label: string; value: string | number; tone?: ScoreTone }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-base font-semibold tabular-nums",
          tone && toneClasses[tone]
        )}
      >
        {value}
      </span>
    </div>
  );
}
