import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAcademicStore } from "@/lib/academic/store";
import { type AppState, DEFAULT_STATE } from "@/lib/academic/types";
import { useI18n } from "@/lib/academic/i18n";
import { Download, Upload, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/Header";

export function DataPage() {
  const { state, replace, reset } = useAcademicStore();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic-hub-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppState>;
        if (!parsed || !Array.isArray(parsed.semesters)) throw new Error("Invalid file");

        replace({ ...DEFAULT_STATE, ...parsed } as AppState);
        
        toast.success("Imported");
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <PageHeader title={t("data.title")} description={t("data.desc")} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Download className="h-4 w-4 text-primary" /> {t("data.export")}</div>
          <p className="mt-2 text-sm text-muted-foreground">Download a JSON snapshot of every semester, subject, and configuration.</p>
          <Button onClick={exportJSON} className="mt-4 w-full"><Download className="h-4 w-4" /> {t("data.export")}</Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Upload className="h-4 w-4 text-primary" /> {t("data.import")}</div>
          <p className="mt-2 text-sm text-muted-foreground">Restore a previously exported JSON snapshot. Replaces current data.</p>
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
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="mt-4 w-full">
            <Upload className="h-4 w-4" /> {t("data.import")}
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Trash2 className="h-4 w-4 text-destructive" /> {t("data.clear")}</div>
          <p className="mt-2 text-sm text-muted-foreground">Wipes every key the app stores in this browser. Cannot be undone.</p>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="mt-4 w-full">
            <Trash2 className="h-4 w-4" /> {t("data.clear")}
          </Button>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-success/10 text-success">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Privacy guarantee</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The app uses only browser localStorage. Nothing is sent to a server. Export regularly if data is important.
            </p>
          </div>
        </div>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("data.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("data.confirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("data.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                reset();
                toast.success("All data cleared");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("data.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
