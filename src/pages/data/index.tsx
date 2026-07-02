import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/Header";
import { useI18n } from "@/i18n/use-i18n";
import { DeleteAllDataAlert, ImportData, ExportData } from "@/pages/data/components";
import ExtensionDownloadSection from "@/pages/data/components/ExtensionDownloadSection";

export default function DataPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t("data.title")} description={t("data.desc")} />

      <div className="grid gap-4 md:grid-cols-3">
        <ExportData />
        <ImportData />
        <DeleteAllDataAlert />
      </div>

      <Card className="my-6 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-success/10 text-success">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("data.privacyHeader")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("data.privacyDesc") || "All data is stored locally in your browser. We do not collect any data."}
            </p>
          </div>
        </div>
      </Card>

      <ExtensionDownloadSection />
    </>
  );
}
