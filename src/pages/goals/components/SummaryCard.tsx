import { Card } from "@/components/ui/card";

export function SummaryCard({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <Card className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-center">{value}</div>
            {hint && <div className="text-xs text-muted-foreground text-center">{hint}</div>}
        </Card>
    );
}
