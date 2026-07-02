import { PageHeader } from "@/components/Header";
import { useI18n } from "@/i18n/use-i18n";
import { StandardReferenceCard } from "@/pages/scale/components/StandardReferenceCard";
import { ActiveScaleCard } from "@/pages/scale/components/ActiveScaleCard";

export default function ScalePage() {
    const { t } = useI18n();

    return (
        <>
            <PageHeader title={t("scale.title")} description={t("scale.desc")} />

            <div className="grid gap-4 lg:grid-cols-2">
                <StandardReferenceCard />
                
                <ActiveScaleCard />
            </div>
        </>
    );
}
