import { useAcademicStore } from "@/hooks/useAcademicStore";
import { cn } from "@/lib/utils";
import type { TGradingScale } from "@/types/types";
import { useState } from "react";

export function ScaleSwitcher() {
    const { state, update } = useAcademicStore();
    const [activeScale, setActiveScale] = useState<TGradingScale>(state.activeScale ?? "10");

    const handleScaleChange = (scale: TGradingScale) => {
        setActiveScale(scale);
        update((s) => ({
            ...s,
            activeScale: scale,
            eligibleForScholarshipGPA: Number((+scale * 0.8).toFixed(1)),
        }));
    }

    return (
        <>
            <div className="flex rounded-md border border-border overflow-hidden text-xs font-semibold">
                {(["10", "4", "100"] as TGradingScale[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => handleScaleChange(s)}
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