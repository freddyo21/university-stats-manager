import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Settings2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAcademicStore } from "@/lib/academic/store";
import type { AppState, LetterGradeRange, PrecisionMode, Semester, Subject } from "@/types/types";
import {
    hasComponentFail,
    gpa4FromScore10,
    semesterGPA10,
    subjectPassed,
    subjectScore10,
    to100,
    toLetter,
    weightTotal,
} from "@/lib/academic/calc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/Header";
import { uuidv7 } from "@/utils/uuid";
import { useI18n } from "@/hooks/use-i18n";

function newSubject(): Subject {
    return {
        id: uuidv7(),
        code: "",
        name: "",
        credits: 3,
        weights: { process: 10, midterm: 20, practice: 20, final: 50 },
        scores: { process: null, midterm: null, practice: null, final: null },
        isExempt: false,
    };
}

function newSemester(index: number, targetGPA: number): Semester {
    return {
        id: uuidv7(),
        name: `Semester ${index + 1}`,
        targetGPA,
        subjects: [newSubject()]
    };
}

export function GradeEntryPage() {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [showConfig, setShowConfig] = useState(false);

    const addSemester = () =>
        update((s) => ({ ...s, semesters: [...s.semesters, newSemester(s.semesters.length, s.targetGPA)] }));


    useEffect(() => {
        // (async () => {
        //     try {
        //         // 1. Gọi lệnh Fetch lấy vỏ bọc kết nối HTTP
        //         const response = await axios.get("/api/captcha", {
        //             headers: {
        //                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        //                 "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        //                 "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        //             },

        //             validateStatus: (status) => {
        //                 return status === 200 || status === 403;
        //             },
        //         });

        //         console.log("Response:", response.data);

        //         const {
        //             formBuildId,
        //             formId,
        //             captchaSid,
        //             captchaToken,
        //             captchaQuestion,
        //             captchaImageSrc,
        //             sessionCookie
        //         } = response.data;

        //         console.log("Captcha Question:", captchaQuestion);

        //         window.open(captchaImageSrc, '_blank');

        //         const captchaAnswer = prompt("Please enter the Captcha answer from the opened image:");

        //         const login = await axios.post("/api/sync", {
        //             username: "24520084",
        //             password: "duyanh5069",
        //             formBuildId,
        //             formId,
        //             captchaSid,
        //             captchaToken,
        //             captchaAnswer,
        //             sessionCookie
        //         });

        //         console.log("Login response:", login.data);

        //         if (!login.config) {
        //             throw new Error("Không thể kết nối đến cổng API lấy Captcha");
        //         }

        //         // const response = await axios.get("https://daa.uit.edu.vn/sinhvien/kqhoctap", {
        //         //     headers: {
        //         //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        //         //         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        //         //         "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        //         //     },

        //         //     validateStatus: (status) => {
        //         //         return status === 200 || status === 403;
        //         //     },
        //         // });

        //         // console.log("Response:", response.data);
        //     } catch (error: any) {
        //         console.error("Lỗi xử lý luồng lấy phiên đăng nhập:", error);
        //     }
        // })()

        // const EXTENSION_ID = "kbfgedmhlemfpkinnfjnchkpnjmmaejf";

        // async function fetchDaaViaExtension() {
        //     return new Promise((resolve, reject) => {
        //         // Ép kiểu window thành any để truy cập các thuộc tính tùy biến
        //         const globalWindow = window as any;

        //         if (!globalWindow.chrome || !globalWindow.chrome.runtime || !globalWindow.chrome.runtime.sendMessage) {
        //             reject("Vui lòng cài đặt Chrome Extension hỗ trợ để tiếp tục!");
        //             return;
        //         }

        //         // Gọi lệnh thông qua biến đã ép kiểu
        //         globalWindow.chrome.runtime.sendMessage(
        //             EXTENSION_ID,
        //             { action: "fetch_daa" },
        //             (response: any) => {
        //                 if (globalWindow.chrome.runtime.lastError) {
        //                     reject(globalWindow.chrome.runtime.lastError.message);
        //                 } else if (response && response.success) {
        //                     resolve(response.data);
        //                 } else {
        //                     reject(response?.error || "Lỗi không xác định từ Extension");
        //                 }
        //             }
        //         );
        //     });
        // }

        // // Cách sử dụng trong luồng của bạn:
        // (async () => {
        //     try {
        //         console.log("Đang gọi qua Extension để bypass CORS...");
        //         const htmlData = await fetchDaaViaExtension();

        //         console.log("Đã lấy được HTML thô từ trường:", htmlData);
        //         // Giờ bạn có thể dùng Regex/Cheerio để bóc tách CaptchaSid, FormBuildId từ biến htmlData này
        //         // Rồi hiển thị ảnh Captcha lên cho người dùng nhập bình thường!

        //     } catch (err) {
        //         console.error("Lỗi:", err);
        //     }
        // })();
    }, []);

    return (
        <>
            <PageHeader
                title={t("entry.title")}
                description={t("entry.desc")}
                actions={
                    <Button size="sm" onClick={() => setShowConfig((v) => !v)}>
                        <Settings2 className="h-4 w-4" /> <span className="hidden sm:inline">{t("common.settings")}</span>
                    </Button>
                }
            />

            {showConfig && <ConfigPanel state={state} update={update} onClose={() => setShowConfig(false)} />}

            {state.semesters.length === 0 ? (
                <Card className="border-dashed bg-muted/30 p-10 text-center">
                    <p className="text-sm text-muted-foreground">{t("entry.empty")}</p>
                    <Button onClick={addSemester} className="mt-4">
                        <Plus className="h-4 w-4" /> {t("entry.addSemester")}
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {state.semesters.map((sem, idx) => (
                        <SemesterCard key={sem.id} semester={sem} index={idx} />
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-center">
                <Button onClick={addSemester} variant="outline">
                    <Plus className="h-4 w-4" /> {t("entry.addSemester")}
                </Button>
            </div>
        </>
    );
}

function clampNum(v: string, min: number, max: number) {
    const n = Number(v);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
}

function ConfigPanel({
    state,
    update,
    onClose,
}: {
    state: AppState;
    update: (u: (s: AppState) => AppState) => void;
    onClose: () => void;
}) {
    const { t } = useI18n();
    return (
        <Card className="mb-6 p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h3 className="text-base font-semibold">{t("common.settings")}</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    {t("common.done")}
                </Button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("settings.subjectPass")} (0–10)
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={state.subjectPassThreshold}
                        onChange={(e) =>
                            update((s) => ({ ...s, subjectPassThreshold: clampNum(e.target.value, 0, 10) }))
                        }
                    />
                </div>
                <div className="rounded-md border border-border p-3">
                    <label className="flex items-start gap-2.5">
                        <Checkbox
                            checked={state.componentPassEnabled}
                            onCheckedChange={(v) => update((s) => ({ ...s, componentPassEnabled: Boolean(v) }))}
                            className="mt-0.5"
                        />
                        <div className="min-w-0">
                            <div className="text-sm font-medium">{t("settings.componentToggle")}</div>
                            <div className="mt-2">
                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                    {t("settings.componentThreshold")} (0–10)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    disabled={!state.componentPassEnabled}
                                    value={state.componentPassThreshold}
                                    onChange={(e) =>
                                        update((s) => ({ ...s, componentPassThreshold: clampNum(e.target.value, 0, 10) }))
                                    }
                                />
                            </div>
                        </div>
                    </label>
                </div>
                <div className="rounded-md border border-border p-3 sm:col-span-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Độ chính xác GPA
                    </Label>
                    <RadioGroup
                        value={String(state.precisionMode)}
                        onValueChange={(v) =>
                            update((s) => ({ ...s, precisionMode: Number(v) as PrecisionMode }))
                        }
                        className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="1" />
                            1 chữ số thập phân
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="2" />
                            2 chữ số thập phân
                        </label>
                    </RadioGroup>
                </div>
            </div>
        </Card>
    );
}

function SemesterCard({ semester }: { semester: Semester; index: number }) {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const { gpa10, credits, passedCredits, exemptCredits } = useMemo(
        () =>
            semesterGPA10(
                semester,
                state.subjectPassThreshold,
                state.componentPassEnabled,
                state.componentPassThreshold,
                state.precisionMode,
            ),
        [semester, state.subjectPassThreshold, state.componentPassEnabled, state.componentPassThreshold, state.precisionMode],
    );

    const setSemester = (patch: Partial<Semester>) =>
        update((s) => ({
            ...s,
            semesters: s.semesters.map((x) => (x.id === semester.id ? { ...x, ...patch } : x)),
        }));

    const remove = () =>
        update((s) => ({ ...s, semesters: s.semesters.filter((x) => x.id !== semester.id) }));

    const addSubject = () => setSemester({ subjects: [...semester.subjects, newSubject()] });

    const updateSubject = (id: string, patch: Partial<Subject>) =>
        setSemester({
            subjects: semester.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        });

    const removeSubject = (id: string) =>
        setSemester({ subjects: semester.subjects.filter((s) => s.id !== id) });

    return (
        <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-muted/30 p-4">
                <button
                    onClick={() => setOpen(!open)}
                    className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
                    aria-label="Toggle"
                >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="min-w-0">
                    <Input
                        value={semester.name}
                        onChange={(e) => setSemester({ name: e.target.value })}
                        className="h-8 max-w-xs border-none bg-transparent px-3 text-base font-semibold focus-visible:ring-0"
                    />
                    <div className="mt-0.5 text-xs text-muted-foreground">
                        {semester.subjects.length} {t("common.subjects")} · {credits} {t("common.credits")} · {passedCredits} {t("common.credits.passed")} · {credits - passedCredits - exemptCredits} {t("common.credits.failed")} · {exemptCredits} {t("common.credits.exempt")} · {t("common.gpa")}{" "}
                        <span className="font-semibold text-foreground">{gpa10?.toFixed(2) ?? "—"}</span>
                    </div>
                </div>
                <Button size="icon" variant="ghost" onClick={remove} aria-label="Delete semester">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {open && (
                <div className="space-y-3 p-4">
                    {semester.subjects.map((sub) => (
                        <SubjectRow
                            key={sub.id}
                            subject={sub}
                            letterGrades={state.letterGrades}
                            precisionMode={state.precisionMode}
                            subjectPass={state.subjectPassThreshold}
                            componentPassEnabled={state.componentPassEnabled}
                            componentPass={state.componentPassThreshold}
                            onChange={(patch) => updateSubject(sub.id, patch)}
                            onDelete={() => removeSubject(sub.id)}
                        />
                    ))}
                    <Button variant="outline" size="sm" onClick={addSubject}>
                        <Plus className="h-4 w-4" /> {t("entry.addSubject")}
                    </Button>
                </div>
            )}
        </Card>
    );
}

function SubjectRow({
    subject,
    letterGrades,
    precisionMode,
    subjectPass,
    componentPassEnabled,
    componentPass,
    onChange,
    onDelete,
}: {
    subject: Subject;
    letterGrades: LetterGradeRange[];
    precisionMode: PrecisionMode;
    subjectPass: number;
    componentPassEnabled: boolean;
    componentPass: number;
    onChange: (patch: Partial<Subject>) => void;
    onDelete: () => void;
}) {
    const { t } = useI18n();
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

    const setScore = (k: keyof Subject["scores"], v: string) => {
        const n = v === "" ? null : Number(v);
        onChange({
            scores: { ...subject.scores, [k]: n === null || isNaN(n) ? null : Math.min(10, Math.max(0, n)) },
        });
    };

    const setWeight = (k: keyof Subject["weights"], v: string) => {
        const n = Number(v);
        onChange({ weights: { ...subject.weights, [k]: isNaN(n) ? 0 : Math.min(100, Math.max(0, n)) } });
    };

    const setExempt = (v: boolean) => {
        onChange({ isExempt: v });
    };

    const components: { key: keyof Subject["scores"]; label: string }[] = [
        { key: "process", label: t("entry.process") },
        { key: "midterm", label: t("entry.midterm") },
        { key: "practice", label: t("entry.practice") },
        { key: "final", label: t("entry.final") },
    ];

    const rowFail = passed === false;

    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-4 transition-colors",
                rowFail ? "border-destructive/50 bg-destructive/5" : "border-border",
            )}
        >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[8rem_minmax(0,2fr)_6rem_auto]">
                <div className="min-w-0">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("entry.subjectCode")}</Label>
                    <Input
                        value={subject.code}
                        placeholder="CS101"
                        onChange={(e) => onChange({ code: e.target.value.slice(0, 16) })}
                    />
                </div>
                <div className="min-w-0">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("entry.subjectName")}</Label>
                    <Input
                        value={subject.name}
                        placeholder="Introduction to Programming"
                        onChange={(e) => onChange({ name: e.target.value.slice(0, 120) })}
                    />
                </div>
                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("common.credits")}</Label>
                    <Input
                        type="number"
                        min={0}
                        max={20}
                        value={subject.credits}
                        onChange={(e) =>
                            onChange({ credits: Math.min(20, Math.max(0, Number(e.target.value) || 0)) })
                        }
                        className="w-24"
                    />
                </div>
                <div className="flex items-end">
                    <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete subject">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="mt-4 mb-2 flex gap-2 items-center">
                <Checkbox
                    id={`exempt-${subject.id}`}
                    checked={subject.isExempt}
                    onCheckedChange={setExempt}
                />
                <label htmlFor={`exempt-${subject.id}`}
                    className="text-sm font-medium leading-none">
                    {t("common.exempt")}
                </label>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-140 text-sm">
                    <thead>
                        <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="pb-1 text-left font-medium">{t("entry.process")} / {t("entry.midterm")}…</th>
                            <th className="pb-1 text-left font-medium">{t("entry.weight")}</th>
                            <th className="pb-1 text-left font-medium">{t("entry.score")}</th>
                            <th className="pb-1 text-left font-medium">{t("common.status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((c) => {
                            const s = subject.scores[c.key];
                            const w = subject.weights[c.key];
                            const disabled = w <= 0;
                            const failed = !disabled && componentPassEnabled && s !== null && s < componentPass;
                            return (
                                <tr key={c.key} className="border-t border-border/60">
                                    <td className="py-2 pr-2 font-medium">{c.label}</td>
                                    <td className="py-2 pr-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={w}
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
                                            <span className="text-xs text-muted-foreground">{t("entry.weightDisabled")}</span>
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

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
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
    );
}

function Stat({
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
