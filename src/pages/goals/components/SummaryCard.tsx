import { Card } from "@/components/ui/card";
import type { ComponentType } from "react";

type SummaryTone = "muted" | "primary" | "success" | "warning" | "destructive";

export function SummaryCard({
    icon: Icon,
    label,
    value,
    hint,
    tone = "muted",
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint?: string;
    tone?: SummaryTone;
}) {
    const toneClasses = {
        muted: "border-border bg-card",
        primary: "border-primary/20 bg-primary/5",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        destructive: "border-destructive/20 bg-destructive/5",
    }[tone];

    const iconClasses = {
        muted: "text-primary",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive",
    }[tone];

    return (
        <Card className={`p-4 ${toneClasses}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className={`h-4 w-4 ${iconClasses}`} />
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-center">{value}</div>
            {hint && <div className="text-xs text-muted-foreground text-center">{hint}</div>}
        </Card>
    );
}
