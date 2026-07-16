import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/use-i18n";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import type { TranslationKey } from "@/i18n/i18n-types";
import { Download } from "lucide-react";
import { toast } from "sonner";

declare global {
    interface FileSystemWritableFileStream {
        write(data: string | Blob): Promise<void>;
        close(): Promise<void>;
    }
    interface FileSystemFileHandle {
        createWritable(): Promise<FileSystemWritableFileStream>;
    }
    interface Window {
        showSaveFilePicker?: (options?: {
            suggestedName?: string;
            types?: { description: string; accept: Record<string, string[]> }[];
        }) => Promise<FileSystemFileHandle>;
    }
}

export function ExportData() {
    const { state } = useAcademicStore();
    const { t } = useI18n();

    async function exportJSON(state: unknown, t: (key: TranslationKey) => string | undefined) {
        const json = JSON.stringify(state, null, 2);
        const filename = `academic-hub-${new Date().toISOString().slice(0, 10)}.json`;

        // Chrome/Edge/Opera: có Promise thật, biết chính xác Save hay Cancel
        if (typeof window !== "undefined" && window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{ description: "JSON file", accept: { "application/json": [".json"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(json);
                await writable.close();

                // Chỉ tới đây khi user đã thực sự bấm "Save" và viết file xong
                toast.success(t("data.export.success") || "Data exported successfully");
            } catch (err: any) {
                if (err?.name === "AbortError") {
                    // User bấm Cancel trong dialog -> không làm gì cả, không toast
                    return;
                }
                console.error("[academic-hub] Export failed:", err);
                toast.error(t("data.export.failed") || "Failed to export data");
            }
            return;
        }

        // Fallback cho Firefox/Safari (chưa hỗ trợ showSaveFilePicker):
        // KHÔNG có cách nào biết user Save hay Cancel -> giữ hành vi cũ (toast ngay sau khi trigger download).
        try {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error("[academic-hub] Export failed:", err);
            toast.error(t("data.export.failed") || "Failed to export data");
        }
    }

    return (
        <>
            <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Download className="h-4 w-4 text-primary" /> {t("data.export.DEFAULT") || "Export Data"}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                    {t("data.export.desc") || "Download a JSON snapshot of every semester, subject, and configuration."}
                </p>

                <Button onClick={() => exportJSON(state, t)} className="mt-4 w-full" aria-label="Export data">
                    <Download className="h-4 w-4" /> {t("data.export.DEFAULT") || "Export Data"}
                </Button>
            </Card>
        </>
    )
}