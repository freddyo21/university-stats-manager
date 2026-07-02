import { useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uuidv7 } from "@/utils/uuid";
import { PageHeader } from "@/components/Header";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useI18n } from "@/i18n/use-i18n";
import type { ISemester } from "@/types/interfaces/ISemester";
import { SemesterCard } from "@/pages/index/components/SemesterCard";
import { newSubject } from "@/utils/index-helpers";
import { ConfigPanel } from "@/pages/index/components/ConfigPanel";

function newSemester(index: number, targetGPA: number): ISemester {
    return {
        id: uuidv7(),
        name: `Semester ${index + 1}`,
        semesterNumber: index + 1,
        targetGPA,
        subjects: [newSubject()]
    };
}

export default function IndexPage() {
    const { state, update } = useAcademicStore();
    const { t } = useI18n();
    const [showConfig, setShowConfig] = useState(false);

    const addSemester = () =>
        update((s) => ({
            ...s,
            semesters: [
                ...s.semesters,
                newSemester(s.semesters.length, s.targetGPA)
            ]
        }));

    return (
        <>
            <PageHeader
                title={t("entry.title")}
                description={
                    <>
                        {t("entry.desc")}
                    </>
                }
                actions={
                    <Button size="sm" onClick={() => setShowConfig((v) => !v)} aria-label={t("common.settings")}>
                        <Settings2 className="h-4 w-4" /> <span className="hidden sm:inline">{t("common.settings")}</span>
                    </Button>
                }
            />

            {showConfig && <ConfigPanel state={state} update={update} onClose={() => setShowConfig(false)} />}

            {state.semesters.length === 0 ? (
                <Card className="border-dashed bg-muted/30 p-10 text-center">
                    <p className="text-sm text-muted-foreground">{t("entry.empty")}</p>
                    <Button onClick={addSemester} className="mt-4" aria-label={t("entry.addSemester")}>
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
                <Button onClick={addSemester} variant="outline" aria-label={t("entry.addSemester")}>
                    <Plus className="h-4 w-4" /> {t("entry.addSemester")}
                </Button>
            </div>
        </>
    );
}