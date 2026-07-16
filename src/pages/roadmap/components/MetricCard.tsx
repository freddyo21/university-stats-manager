import { cn } from "@/lib/utils";
import type { ScoreTone } from "@/types/types";
import type { ComponentType } from "react";

export function MetricCard({
    icon: Icon,
    label,
    value,
    tone = "muted"
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    tone?: ScoreTone
}) {
    const toneClasses = {
        muted: "border-border bg-card",
        info: "border-info/20 bg-info/5",
        primary: "border-primary/20 bg-primary/5",
        success: "border-success/20 bg-success/5",
        accent: "border-accent/20 bg-accent/5",
        warning: "border-warning/20 bg-warning/5",
        error: "border-error/20 bg-error/5",
        destructive: "border-destructive/20 bg-destructive/5",
    }[tone];

    const iconClasses = {
        muted: "text-primary",
        info: "text-info",
        primary: "text-primary",
        success: "text-success",
        accent: "text-accent",
        warning: "text-warning",
        error: "text-error",
        destructive: "text-destructive",
    }[tone];

    return (
        <div className={cn("rounded-md border p-3", toneClasses)}>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon className={`h-3 w-3 ${iconClasses}`} /> {label}
            </div>
            <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
        </div>
    );
}