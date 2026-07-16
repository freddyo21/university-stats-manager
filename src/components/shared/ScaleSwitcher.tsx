import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useActiveScale } from "@/hooks/useActiveScale";
import { cn } from "@/lib/utils";
import type { TGradingScale } from "@/types/types";

export function ScaleSwitcher() {
    const { state, hydrated } = useAcademicStore();
    const activeScale = state.activeScale ?? "10";

    const { setActiveScale } = useActiveScale();

    if (!hydrated) return null;

    return (
        <>
            <div className="flex rounded-md border border-border overflow-hidden text-xs font-semibold">
                {(["10", "4", "100"] as TGradingScale[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveScale(s)}
                        className={cn(
                            "px-2.5 py-1 transition-colors cursor-pointer",
                            activeScale === s
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted",
                        )}
                    >
                        /{s}
                    </button>
                ))}
            </div>
        </>
    );
}