import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IAppState } from "@/types/interfaces/IAppState";
import type { TPrecisionMode } from "@/types/types";
import { clampNum } from "@/utils/helpers";
import { useI18n } from "@/i18n/use-i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export function ConfigPanel({
    state,
    update,
    onClose,
}: {
    state: IAppState;
    update: (u: (s: IAppState) => IAppState) => void;
    onClose: () => void;
}) {
    const { t } = useI18n();
    return (
        <Card className="mb-6 p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h3 className="text-base font-semibold">{t("common.settings")}</h3>
                <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("common.done")}>
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
                            update((s) => ({ ...s, precisionMode: Number(v) as TPrecisionMode }))
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