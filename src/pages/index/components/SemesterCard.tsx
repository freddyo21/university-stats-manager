import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useI18n } from "@/i18n/use-i18n";
import type { ISubject } from "@/types/interfaces/ISubject";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SubjectRow } from "./SubjectRow";
import { Semester } from "@/entities/Semester";
import { Subject } from "@/entities/Subject";
import { AcademicSemesterPicker } from "./AcademicSemesterPicker.";

export function SemesterCard({ semester: rawSemester }: { semester: Semester; index: number }) {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [open, setOpen] = useState(true);
    const [openSignal, setOpenSignal] = useState<{ open: boolean; tick: number } | null>(null);
    const [semExpanded, setSemExpanded] = useState(true);

    const semester = useMemo(() => {
        return rawSemester instanceof Semester ? rawSemester : new Semester(rawSemester);
    }, [rawSemester]);

    const {
        letterGrades,
        subjectPassThreshold,
        componentThresholdEnabled,
        componentPassThreshold,
        scoreInputMode,
        presetId,
    } = state;

    const { gpa10, credits, passedCredits, failedCredits, exemptCredits } = useMemo(
        () =>
            semester.calculateSemesterMetrics({
                letterGrades,
                subjectPassThreshold,
                componentThresholdEnabled,
                componentPassThreshold,
                scoreInputMode,
                presetId,
            }),
        [
            semester,
            letterGrades,
            subjectPassThreshold,
            componentThresholdEnabled,
            componentPassThreshold,
            scoreInputMode,
            presetId
        ],
    );

    // Cập nhật thông tin Học kỳ 
    const setSemester = (patch: Partial<Semester>) =>
        update((state) => ({
            ...state,
            semesters: state.semesters.map((sem) => {
                if (sem.id !== semester.id) return sem;

                // 🚀 ĐÚC LẠI CLASS INSTANCE: Gom dữ liệu cũ trộn với patch mới
                return new Semester({
                    id: sem.id,
                    // name: patch.name !== undefined ? patch.name : sem.name,
                    semesterNumber: patch.semesterNumber !== undefined ? patch.semesterNumber : sem.semesterNumber,
                    targetGPA: patch.targetGPA !== undefined ? patch.targetGPA : sem.targetGPA,
                    semesterId: patch.semesterId !== undefined ? patch.semesterId : sem.semesterId,
                    // Nếu patch có truyền mảng subjects mới thì lấy, không thì giữ nguyên mảng instance cũ
                    subjects: patch.subjects !== undefined ? patch.subjects : sem.subjects,
                });
            }),
        }));

    // Xóa Học kỳ (Giữ nguyên mảng instance cũ, chỉ lọc bớt phần tử)
    const remove = () =>
        update((state) => ({
            ...state,
            semesters: state.semesters.filter((x) => x.id !== semester.id)
        }));

    // Thêm Môn học mới tinh (newSubject phải trả về một Instance Class Subject mới nguyên)
    const addSubject = () => {
        const newSubInstance = new Subject();
        setSemester({
            subjects: [...semester.subjects, newSubInstance]
        });
    };

    // Cập nhật Môn học    
    const updateSubject = (id: string, patch: Partial<ISubject>) => {
        const updatedSubjects = semester.subjects.map((sub) => {
            if (sub.id !== id) return sub;

            // 🚀 ĐÚC LẠI CLASS INSTANCE CHO SUBJECT: Đập tan lỗi lột sạch method
            return new Subject({
                id: sub.id,
                code: patch.code !== undefined ? patch.code : sub.code,
                name: patch.name !== undefined ? patch.name : sub.name,
                credits: patch.credits !== undefined ? patch.credits : sub.credits,
                weights: patch.weights !== undefined ? patch.weights : {
                    process: sub.weights?.process ?? null,
                    midterm: sub.weights?.midterm ?? null,
                    practice: sub.weights?.practice ?? null,
                    final: sub.weights?.final ?? null,
                },
                scores: patch.scores !== undefined ? patch.scores : {
                    process: sub.scores.process,
                    midterm: sub.scores.midterm,
                    practice: sub.scores.practice,
                    final: sub.scores.final,
                },
                studyType: patch.studyType !== undefined ? patch.studyType : sub.studyType,
                gpa10: patch.gpa10 !== undefined ? patch.gpa10 : sub.gpa10,
            });
        });

        setSemester({ subjects: updatedSubjects });
    };

    // Xóa Môn học
    const removeSubject = (id: string) =>
        setSemester({
            subjects: semester.subjects.filter((s) => s.id !== id)
        });

    const broadcastOpen = (val: boolean) => {
        setSemExpanded(val);
        setOpenSignal((s) => ({ open: val, tick: (s?.tick ?? 0) + 1 }));
    };

    return (
        <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border bg-muted/30 p-4">
                <button
                    onClick={() => setOpen(!open)}
                    className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted cursor-pointer"
                    aria-label={`${open ? t("common.collapse.DEFAULT") : t("common.expand.DEFAULT")} ${t("common.semester")}`}
                >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="min-w-0">
                    {/* <Input
                        value={semester.semesterId} // Use semester.semesterId as the value to ensure uniqueness
                        onChange={(e) => setSemester({ name: e.target.value })}
                        className="h-8 max-w-xs border-none bg-transparent px-3 text-base font-semibold focus-visible:ring-0"
                    /> */}
                    <AcademicSemesterPicker
                        value={semester.semesterId}
                        onChange={(id) => setSemester({ semesterId: id })}
                    />
                    <div className="mt-0.5 text-xs text-muted-foreground">
                        {semester.subjects.length} {t("common.subjects")} · {credits} {t("common.credits.DEFAULT")} · {passedCredits} {t("common.credits.passed")} · {failedCredits} {t("common.credits.failed")} · {exemptCredits} {t("common.credits.exempt")} · {t("common.gpa")}{" "}
                        <span className="font-semibold text-foreground">{gpa10?.toFixed(2) ?? "—"}</span>
                    </div>
                </div>

                <Button size="sm" variant="ghost" className="text-xs px-2"
                    onClick={() => broadcastOpen(!semExpanded)}
                    aria-label={semExpanded ? t("common.collapse.all") : t("common.expand.all")}>
                    {semExpanded ? t("common.collapse.all") : t("common.expand.all")}
                </Button>

                <Button size="icon" variant="ghost" onClick={remove} aria-label={t("common.delete")}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {open && (
                <div className="space-y-3 p-4">
                    {semester.subjects.map((sub) => (
                        <SubjectRow
                            key={sub.id}
                            subject={sub}
                            openSignal={openSignal}
                            onChange={(patch) => updateSubject(sub.id, patch)}
                            onDelete={() => removeSubject(sub.id)}
                        />
                    ))}
                    <Button variant="outline" size="sm" onClick={addSubject}
                        aria-label={t("entry.addSubject")}>
                        <Plus className="h-4 w-4" /> {t("entry.addSubject")}
                    </Button>
                </div>
            )}
        </Card>
    );
}
