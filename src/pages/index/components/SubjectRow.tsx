import "./SubjectRow.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/utils";
import type { ISubject } from "@/types/interfaces/ISubject";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Stat } from "./Stat";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import type { Subject } from "@/entities/Subject";
import { StudyStatusSelect } from "./StudyStatusSelect";

const COMPONENTS_CONFIG = [
    { key: "process", labelKey: "entry.process" },
    { key: "midterm", labelKey: "entry.midterm" },
    { key: "practice", labelKey: "entry.practice" },
    { key: "final", labelKey: "entry.final" },
] as const;

const STATUS_STYLE = {
    exempt: "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
    inProgress: "text-xs text-muted-foreground",
    passed: "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success",
    failed: "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive",
} as const;

const Sanitize = {
    score: (v: string): number | null => {
        const n = v === "" ? null : Number(v);
        return n === null || isNaN(n) ? null : Math.min(10, Math.max(0, n));
    },
    weight: (v: string): number => {
        const n = Number(v);
        return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
    }
};

const getScoreTone = (score: number | null): "muted" | "success" | "primary" | "warning" | "destructive" => {
    if (score === null) return "muted";
    if (score >= 8.0) return "success";
    if (score >= 6.5) return "primary";
    if (score >= 5.0) return "warning";
    return "destructive";
};

export function SubjectRow({
    subject,
    openSignal,
    onChange,
    onDelete,
}: {
    subject: Subject;
    openSignal: { open: boolean; tick: number } | null;
    onChange: (patch: Partial<ISubject>) => void;
    onDelete: () => void;
}) {
    const { state } = useAcademicStore();
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const [prevSignal, setPrevSignal] = useState(openSignal);

    // Sync signal đóng mở component từ component cha
    if (openSignal !== prevSignal) {
        setPrevSignal(openSignal);
        setOpen(openSignal !== null ? openSignal.open : true);
    }

    const {
        presetId,
        precisionMode,
        subjectPassThreshold,
        componentThresholdEnabled,
        componentPassThreshold,
        letterGrades,
        scoreInputMode,
    } = state;

    // 1. Lấy điểm hệ 10 sạch từ Class Subject (Class tự xử lý gpaOnly hoặc tính từ điểm thành phần)
    const score = subject.calculateGPA10(presetId);


    const compFail = subject.hasComponentFail(
        componentThresholdEnabled,
        componentPassThreshold,
        scoreInputMode
    );

    const passed = subject.isPassed({
        subjectPassThreshold,
        componentThresholdEnabled,
        componentPassThreshold,
        scoreInputMode,
        presetId
    });

    // Hiển thị Điểm Chữ (Ví dụ: A+, B, F)
    const letterDisplay = score === null
        ? "—"
        : compFail
            ? "F"
            : subject.getLetterGrade(letterGrades);

    // Hiển thị Thang điểm 10 (Ví dụ: 8.50, 0.0 (F))
    const scale10Display = score === null
        ? "—"
        : compFail
            ? "0.0 (F)"
            : score.toFixed(precisionMode);

    const scale4Display = score === null
        ? "—"
        : compFail
            ? "0.0"
            : (subject.getGPA4(letterGrades) ?? 0).toFixed(1);

    const scale100Display = score === null
        ? "—"
        : compFail
            ? "0"
            : subject.getGPA100()?.toString() ?? "0";
    const gpaInputEnabled = state.scoreInputMode === "gpaOnly";

    // Bước 2: Hàm Facade trung gian để thực hiện việc trigger onChange
    const patchSubject = useCallback(<T extends keyof ISubject>(key: T, value: ISubject[T]) => {
        onChange({ [key]: value });
    }, [onChange]);

    // Bước 3: Các hàm xử lý sự kiện ngắn gọn, sạch sẽ
    const setScore = useCallback((k: keyof ISubject["scores"], v: string) => {
        patchSubject("scores", { ...subject.scores, [k]: Sanitize.score(v) });
    }, [patchSubject, subject.scores]);

    const setWeight = useCallback((k: keyof ISubject["weights"], v: string) => {
        patchSubject("weights", { ...subject.weights, [k]: Sanitize.weight(v) });
    }, [patchSubject, subject.weights]);

    const setGpa10 = useCallback((v: string) => {
        patchSubject("gpa10", Sanitize.score(v));
    }, [patchSubject]);

    // Sử dụng tại component:
    const scoreTone = useMemo(() => getScoreTone(score), [score]);
    const isExempt = subject.studyType === "exempt";

    const layout = useMemo(() => ({
        bodyDisabled: isExempt,
        showBody: open,
        showFooter: open && !isExempt,
        rowFail: passed === false && !isExempt
    }), [isExempt, open, passed]);

    // Xử lý status key gọn gàng
    const statusKey = isExempt ? "exempt" : passed === null ? "inProgress" : passed ? "passed" : "failed";

    const statusClass = STATUS_STYLE[statusKey];
    const statusLabel = t(`common.${statusKey}`);

    const components = useMemo(() =>
        COMPONENTS_CONFIG.map((config) => ({
            key: config.key as keyof ISubject["scores"], // Hãy thêm `as const` ở file config nếu được
            label: t(config.labelKey)
        })), [
        t
    ]);

    const gpaInput = useMemo(() => [
        { key: "gpa10" as const, label: t("entry.gpa10") },
    ], [t]);

    return (
        <div
            className={cn(
                "rounded-lg border bg-card transition-colors",
                layout.rowFail ? "border-destructive/50 bg-destructive/5" : "border-border",
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
                <div className="flex flex-col shrink-0 items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t("common.status")}</span>
                        <StudyStatusSelect 
                            subject={subject}
                            onChange={onChange}
                        />
                    </div>
                </div>
                <Button size="icon" variant="ghost" onClick={onDelete}
                    aria-label={`${t("common.delete")} ${t("common.subject")}`}
                    className="h-8 w-8 shrink-0">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* ── BODY AREA ── */}
            {layout.showBody && (
                <div className="border-t border-border/60 overflow-x-auto px-4 pb-3 pt-3">
                    <table className="w-full min-w-140 text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="pb-1 text-left font-medium">{t("entry.component")}</th>
                                {!gpaInputEnabled && (<th className="pb-1 text-left font-medium">{t("entry.weight")}</th>)}
                                <th className="pb-1 text-left font-medium">{t("entry.score")}</th>
                                <th className="pb-1 text-left font-medium">{t("common.status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!gpaInputEnabled && components.map((c) => {
                                const s = subject.scores[c.key];
                                const w = subject.weights[c.key] ?? 0;
                                const disabled = layout.bodyDisabled || w <= 0;
                                const failed = !layout.bodyDisabled && !disabled && componentThresholdEnabled && s !== null && s < componentPassThreshold;

                                return (
                                    <tr key={c.key} className="border-t border-border/60">
                                        <td className="py-2 pr-2 font-medium">{c.label}</td>
                                        <td className="py-2 pr-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={w}
                                                disabled={layout.bodyDisabled}
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
                            {gpaInputEnabled && gpaInput.map((c) => {
                                const s = subject[c.key];
                                const disabled = layout.bodyDisabled;
                                const isExempt = subject.studyType === "exempt";

                                return (
                                    <tr key={c.key} className="border-t border-border/60">
                                        <td className="py-2 pr-2 font-medium">{c.label}</td>
                                        <td className="py-2 pr-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={10}
                                                step={0.1}
                                                value={s ?? ""}
                                                disabled={disabled}
                                                placeholder={disabled ? "—" : ""}
                                                onChange={(e) => setGpa10(e.target.value)}
                                                className={cn(
                                                    "h-8 w-24",
                                                    disabled && "bg-muted/60",
                                                )}
                                            />
                                        </td>
                                        <td className="py-2" colSpan={2}>
                                            {
                                                isExempt ? (
                                                    <span className={statusClass}>
                                                        {statusLabel}
                                                    </span>
                                                ) : (
                                                    <span className={statusClass}>
                                                        {disabled ? "—" : statusLabel}
                                                    </span>
                                                )
                                            }

                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── FOOTER ROW ── */}
            {layout.showFooter && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                    <div className={cn("grid gap-3", gpaInputEnabled ? "grid-cols-4" : "grid-cols-5")}>
                        {!gpaInputEnabled && (
                            <Stat
                                label={t("entry.weight")}
                                value={`${subject.weightTotal}%`}
                                tone={subject.isWeightValid ? "success" : "destructive"}
                                hint={subject.isWeightValid ? "= 100" : t("entry.weightsMustTotal")}
                            />
                        )}
                        <Stat label="Scale 10" value={scale10Display} tone={scoreTone} />
                        <Stat label="Scale 4" value={scale4Display} tone={scoreTone === "muted" ? "muted" : scoreTone} />
                        <Stat label="Scale 100" value={scale100Display} tone={scoreTone === "muted" ? "muted" : scoreTone} />
                        <Stat label="Letter" value={letterDisplay} tone={scoreTone} />
                    </div>
                    {layout.rowFail && (
                        <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" /> {t("entry.subjectFail")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}