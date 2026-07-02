import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/use-i18n";
import { gpa4FromScore10, hasComponentFail, subjectPassed, subjectScore10, to100, toLetter, weightTotal } from "@/lib/academic/calc";
import { cn } from "@/lib/utils";
import type { ILetterGradeRange } from "@/types/interfaces/ILetterGradeRange";
import type { ISubject } from "@/types/interfaces/ISubject";
import type { TPrecisionMode } from "@/types/types";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Stat } from "./Stat";

export function SubjectRow({
    subject,
    letterGrades,
    precisionMode,
    subjectPass,
    componentPassEnabled,
    componentPass,
    openSignal,
    onChange,
    onDelete,
}: {
    subject: ISubject;
    letterGrades: ILetterGradeRange[];
    precisionMode: TPrecisionMode;
    subjectPass: number;
    componentPassEnabled: boolean;
    componentPass: number;
    openSignal: { open: boolean; tick: number } | null;
    onChange: (patch: Partial<ISubject>) => void;
    onDelete: () => void;
}) {
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const [prevSignal, setPrevSignal] = useState(openSignal);

    if (openSignal !== prevSignal) {
        setPrevSignal(openSignal);
        setOpen(openSignal !== null ? openSignal.open : true);
    }

    const score = subjectScore10(subject, precisionMode);
    const wTotal = weightTotal(subject.weights);
    const wValid = wTotal === 100;

    const compFail = hasComponentFail(subject, componentPassEnabled, componentPass);
    const passed = subjectPassed(subject, subjectPass, componentPassEnabled, componentPass, precisionMode);
    const letterDisplay = score === null ? "—" : compFail ? "F" : toLetter(score, letterGrades);

    const scale10Display = score === null ? "—" : compFail ? "0.0 (F)" : score.toFixed(precisionMode);
    const scale4Display =
        score === null
            ? "—"
            : compFail
                ? "0.0"
                : gpa4FromScore10(score, letterGrades).toFixed(1);

    const scale100Display = score === null ? "—" : compFail ? "0" : String(to100(score));

    const setScore = (k: keyof ISubject["scores"], v: string) => {
        const n = v === "" ? null : Number(v);
        onChange({
            scores: { ...subject.scores, [k]: n === null || isNaN(n) ? null : Math.min(10, Math.max(0, n)) },
        });
    };

    const setWeight = (k: keyof ISubject["weights"], v: string) => {
        const n = Number(v);
        onChange({ weights: { ...subject.weights, [k]: isNaN(n) ? 0 : Math.min(100, Math.max(0, n)) } });
    };

    const setExempt = (v: boolean) => {
        onChange({ isExempt: v });
    };

    const components: { key: keyof ISubject["scores"]; label: string }[] = [
        { key: "process", label: t("entry.process") },
        { key: "midterm", label: t("entry.midterm") },
        { key: "practice", label: t("entry.practice") },
        { key: "final", label: t("entry.final") },
    ];

    // Layout control flags
    const bodyDisabled = subject.isExempt;
    const showBody = open;
    const showFooter = open && !subject.isExempt;
    const rowFail = passed === false && !subject.isExempt;

    return (
        <div
            className={cn(
                "rounded-lg border bg-card transition-colors",
                rowFail ? "border-destructive/50 bg-destructive/5" : "border-border",
            )}
        >
            {/* ── HEADER ROW ── */}
            <div className="flex flex-wrap items-center gap-2 p-3">
                <button
                    onClick={() => setOpen(!open)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md hover:bg-muted"
                    aria-label={`${open ? t("common.collapse.DEFAULT") : t("common.expand.DEFAULT")} ${t("common.subject")}`}
                >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="w-28 shrink-0">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground"
                        htmlFor={`subject-code-${subject.id}`}
                    >
                        {t("entry.subjectCode")}
                    </Label>

                    <Input
                        id={`subject-code-${subject.id}`}
                        value={subject.code}
                        placeholder="CS101"
                        onChange={(e) => onChange({ code: e.target.value.slice(0, 16) })}
                        className="h-8"
                    />
                </div>
                <div className="min-w-40 flex-1">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground"
                        htmlFor={`subject-name-${subject.id}`}
                    >
                        {t("entry.subjectName")}
                    </Label>
                    <Input
                        id={`subject-name-${subject.id}`}
                        value={subject.name}
                        placeholder="Introduction to Programming"
                        onChange={(e) => onChange({ name: e.target.value.slice(0, 120) })}
                        className="h-8"
                    />
                </div>
                <div className="w-20 shrink-0">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground"
                        htmlFor={`subject-credits-${subject.id}`}
                    >
                        {t("common.credits.DEFAULT")}
                    </Label>
                    <Input
                        id={`subject-credits-${subject.id}`}
                        type="number"
                        min={0}
                        max={20}
                        value={subject.credits}
                        onChange={(e) =>
                            onChange({ credits: Math.min(20, Math.max(0, Number(e.target.value) || 0)) })
                        }
                        className="h-8 w-20"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <Checkbox
                        id={`exempt-${subject.id}`}
                        checked={subject.isExempt}
                        onCheckedChange={setExempt}
                    />
                    <label
                        htmlFor={`exempt-${subject.id}`}
                        className="cursor-pointer text-xs font-medium leading-none"
                    >
                        {t("common.exempt")}
                    </label>
                </div>
                <Button size="icon" variant="ghost" onClick={onDelete}
                    aria-label={`${t("common.delete")} ${t("common.subject")}`}
                    className="h-8 w-8 shrink-0">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* ── BODY AREA ── */}
            {showBody && (
                <div className="border-t border-border/60 overflow-x-auto px-4 pb-3 pt-3">
                    <table className="w-full min-w-140 text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="pb-1 text-left font-medium">{t("entry.component")}</th>
                                <th className="pb-1 text-left font-medium">{t("entry.weight")}</th>
                                <th className="pb-1 text-left font-medium">{t("entry.score")}</th>
                                <th className="pb-1 text-left font-medium">{t("common.status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {components.map((c) => {
                                const s = subject.scores[c.key];
                                const w = subject.weights[c.key];
                                const disabled = bodyDisabled || w <= 0;
                                const failed = !bodyDisabled && !disabled && componentPassEnabled && s !== null && s < componentPass;
                                return (
                                    <tr key={c.key} className="border-t border-border/60">
                                        <td className="py-2 pr-2 font-medium">{c.label}</td>
                                        <td className="py-2 pr-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={w}
                                                disabled={bodyDisabled}
                                                onChange={(e) => setWeight(c.key, e.target.value)}
                                                className="h-8 w-20"
                                            />
                                        </td>
                                        <td className="py-2 pr-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={s ?? ""}
                                                disabled={disabled}
                                                placeholder={disabled ? "—" : ""}
                                                onChange={(e) => setScore(c.key, e.target.value)}
                                                className={cn(
                                                    "h-8 w-24",
                                                    failed && "border-destructive text-destructive",
                                                    disabled && "bg-muted/60",
                                                )}
                                            />
                                        </td>
                                        <td className="py-2">
                                            {disabled ? (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            ) : failed ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-destructive">
                                                    <AlertTriangle className="h-3 w-3" /> {t("entry.componentFail")}
                                                </span>
                                            ) : s !== null ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <CheckCircle2 className="h-3 w-3 text-success" /> OK
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── FOOTER ROW ── */}
            {showFooter && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <Stat
                            label={t("entry.weight")}
                            value={`${wTotal}%`}
                            tone={wValid ? "success" : "destructive"}
                            hint={wValid ? "= 100" : t("entry.weightsMustTotal")}
                        />
                        <Stat label="Scale 10" value={scale10Display} tone={score === null ? "muted" : passed ? "primary" : "destructive"} />
                        <Stat label="Scale 4" value={scale4Display} tone="muted" />
                        <Stat label="Scale 100" value={scale100Display} tone="muted" />
                        <Stat label="Letter" value={letterDisplay} tone={score === null ? "muted" : passed ? "primary" : "destructive"} />
                    </div>
                    {rowFail && (
                        <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" /> {t("entry.subjectFail")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}