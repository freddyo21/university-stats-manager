import { useI18n } from "@/i18n/use-i18n";
import type { ISubject } from "@/types/interfaces/ISubject";
import type { TStudyType } from "@/types/types";
import { useCallback } from "react";

const STUDY_TYPE_VALUES: TStudyType[] = ["normal", "retake", "improvement", "exempt"];

const COLOR_MAP: Record<TStudyType, string> = {
    normal: "bg-white text-black",
    retake: "bg-rose-500 text-white",
    improvement: "bg-blue-500 text-white",
    exempt: "bg-purple-500 text-white",
};

const OPEN_COLOR_MAP: Record<TStudyType, string> = {
    normal: "bg-white text-black",
    retake: "bg-white text-black",
    improvement: "bg-white text-black",
    exempt: "bg-white text-black",
};

export function StudyStatusSelect({
    subject,
    onChange,
}: {
    subject: ISubject;
    onChange: (patch: Partial<ISubject>) => void;
}) {
    const { t } = useI18n();

    const setStudyType = useCallback((value: TStudyType) => {
        onChange({ studyType: value });
    }, [onChange]);

    return (
        <select
            className={`select select-xs ${COLOR_MAP[subject.studyType]} open:${OPEN_COLOR_MAP[subject.studyType]} focus:text-black`}
            value={subject.studyType}
            onChange={(e) => setStudyType(e.target.value as TStudyType)}
        >
            {STUDY_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                    {t(`common.${value}`)}
                </option>
            ))}
        </select>
    )
}