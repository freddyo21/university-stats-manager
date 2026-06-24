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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function DeleteAllDataAlert() {
    const { reset } = useAcademicStore();
    const { t } = useI18n();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition(); // Quản lý luồng xử lý bất đồng bộ

    const handleClearData = () => {
        // Đưa hành động xóa bộ nhớ vào Transition để không làm đơ UI của React 19
        startTransition(() => {
            try {
                reset();
                toast.success(t("data.clearSuccess") || "All data cleared");
            } catch (error) {
                toast.error(t("data.clearFailed") || "Failed to clear data safely");
            }
        });
    };

    return (
        <>
            <Card className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    {t("data.clear")}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("data.clearDesc") || "This will permanently delete all semesters, subjects, and configurations. This action cannot be undone."}
                </p>

                <Button
                    variant="destructive"
                    aria-label={t("data.clear")}
                    onClick={() => setConfirmOpen(true)}
                    className="mt-4 w-full"
                >
                    <Trash2 className="h-4 w-4" />
                    {t("data.clear")}
                </Button>
            </Card>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("data.confirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("data.confirmBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>{t("data.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                // Chặn hành vi đóng modal mặc định của Radix để đợi hàm xóa chạy xong an toàn
                                e.preventDefault();
                                handleClearData();
                                setConfirmOpen(false);
                            }}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Clearing..." : t("data.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}