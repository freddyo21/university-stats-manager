import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IAppState } from "@/types/interfaces/IAppState";
import type { TPrecisionMode, TRetakeStrategy } from "@/types/types";
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
                <div className="user-select-none">
                    <Label className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {t("settings.scoreInputMode.DEFAULT")}
                    </Label>
                    <RadioGroup
                        value={state.scoreInputMode}
                        onValueChange={(v) => update((s) => ({ ...s, scoreInputMode: v as IAppState["scoreInputMode"] }))}
                        className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="full" />
                            {t("settings.scoreInputMode.full")}
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="gpaOnly" />
                            {t("settings.scoreInputMode.gpaOnly")}
                        </label>
                    </RadioGroup>
                </div>
                <div className="rounded-md border border-border p-3">
                    <div className="flex gap-2.5">
                        <Checkbox
                            checked={state.componentThresholdEnabled}
                            onCheckedChange={(v) => update((s) => ({ ...s, componentThresholdEnabled: Boolean(v) }))}
                            className="mt-0.5"
                        />
                        <div className="text-sm font-medium">{t("settings.componentToggle")}</div>
                    </div>
                    <div className="min-w-0 flex justify-between items-center mt-2">
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
                        <div>
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                {t("settings.componentThreshold")} (0–10)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                disabled={!state.componentThresholdEnabled}
                                value={state.componentPassThreshold}
                                onChange={(e) =>
                                    update((s) => ({ ...s, componentPassThreshold: clampNum(e.target.value, 0, 10) }))
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="rounded-md border border-border p-3 sm:col-span-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("settings.retakeStrategy.DEFAULT")}
                    </Label>
                    <select
                        value={state.retakeStrategy}
                        onChange={(e) => update((s) => ({ ...s, retakeStrategy: e.target.value as TRetakeStrategy }))}
                        className="select select-bordered border border-black mt-2 w-full bg-white"
                    >
                        <option value="highest">Lấy điểm cao nhất (UIT Standard)</option>
                        <option value="latest">Lấy điểm lần học gần nhất</option>
                    </select>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Áp dụng cho môn học cải thiện; các môn học lại (trả nợ) khi đã đạt (&ge; 5.0) vẫn được tính vào ĐTBCTL theo điểm lần cao nhất.
                    </p>
                </div>
                <div className="rounded-md border border-border p-3 sm:col-span-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("settings.gpaPrecision.DEFAULT")}
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
                            {t("settings.gpaPrecision.number", { number: 1 })}
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <RadioGroupItem value="2" />
                            {t("settings.gpaPrecision.number", { number: 2 })}
                        </label>
                    </RadioGroup>
                </div>
            </div>
        </Card>
    );
}