import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import type { IAppState } from "@/types/interfaces/IAppState";
import { DEFAULT_STATE } from "@/utils/constants";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";


export function ImportData() {
    const { replace } = useAcademicStore();
    const fileRef = useRef<HTMLInputElement>(null);
      const { t } = useI18n();

    const importJSON = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result)) as Partial<IAppState>;
                if (!parsed || !Array.isArray(parsed.semesters)) throw new Error("Invalid file");

                replace({ ...DEFAULT_STATE, ...parsed } as IAppState);

                toast.success(t("data.importSuccess") || "Data imported successfully");
            } catch {
                toast.error(t("data.importFailed") || "Failed to import data. Please ensure the file is a valid JSON snapshot.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Upload className="h-4 w-4 text-primary" /> {t("data.import")}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{t("data.importDesc") || "Restore a previously exported JSON snapshot. Replaces current data."}</p>

                <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) importJSON(f);
                        e.target.value = "";
                    }}
                />

                <Button variant="outline" className="mt-4 w-full" aria-label="Import data"
                    onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> {t("data.import")}
                </Button>
            </Card>
        </>
    )
}