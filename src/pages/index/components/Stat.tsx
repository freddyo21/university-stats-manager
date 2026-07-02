import { cn } from "@/lib/utils";

export function Stat({
    label,
    value,
    tone = "muted",
    hint,
}: {
    label: string;
    value: string;
    tone?: "muted" | "primary" | "success" | "destructive";
    hint?: string;
}) {
    const toneCls = {
        muted: "bg-muted text-foreground",
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        destructive: "bg-destructive/10 text-destructive",
    }[tone];
    return (
        <div className={cn("rounded-md px-3 py-2", toneCls)}>
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
            <div className="text-base font-semibold tabular-nums">{value}</div>
            {hint && <div className="text-[10px] opacity-70">{hint}</div>}
        </div>
    );
}