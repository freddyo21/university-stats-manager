import { GraduationCap, BookOpen, Target, Map, LifeBuoy, ScrollText, ShieldCheck, Globe } from "lucide-react";
import { applyPreset, listPresets } from "@/lib/academic/presets";
import type { TPresetId } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useI18n } from "@/hooks/use-i18n";
import { useAcademicStore } from "@/hooks/useAcademicStore";
import { useEffect } from "react";
import { mergeAcademicStateFromExtension } from "@/lib/academic/store";

export function Layout() {
  const { t, lang, setLang } = useI18n();
  const { state, update } = useAcademicStore();

  const location = useLocation();

  const tabs = [
    { to: "/", label: t("nav.entry"), icon: BookOpen },
    { to: "/scale", label: t("nav.scale"), icon: ScrollText },
    { to: "/goals", label: t("nav.goals"), icon: Target },
    { to: "/roadmap", label: t("nav.roadmap"), icon: Map },
    { to: "/data", label: t("nav.data"), icon: ShieldCheck },
    { to: "/help", label: t("nav.help"), icon: LifeBuoy },
  ] as const;
  
  useEffect(() => {
    const handleExtensionMessage = (event: any) => {
      // Bảo mật ATTT: Chỉ nhận dữ liệu đúng nguồn từ Extension Bridge của bạn
      if (event.data && event.data.source === "EXTENSION_BRIDGE") {
        if (event.data.action === "SYNC_DATA") {
          const receivedData = event.data.data;

          console.log("Đã nhận dữ liệu điểm từ Extension:", receivedData);

          mergeAcademicStateFromExtension(receivedData.data);
        }
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, [mergeAcademicStateFromExtension]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight">{t("app.title")}</div>
              <div className="truncate text-xs text-muted-foreground leading-tight">{t("app.tagline")}</div>
            </div>
          </NavLink>
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8" aria-label={t("common.preset")}>
                  {t("common.preset")}: {t(`common.preset${state.presetId.charAt(0).toUpperCase() + state.presetId.slice(1)}`)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-85">
                <DropdownMenuLabel>{t("common.preset")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {listPresets().map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => update((s) => applyPreset(s, p.id as TPresetId))}>
                    <div className="flex flex-col cursor-pointer">
                      <span className="font-medium">{t(`common.preset${p.id}`)}</span>
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5" aria-label={t("common.language")}>
                  <Globe className="h-4 w-4" /> {lang.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setLang("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLang("vi")}>Tiếng Việt</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tb) => {
              const Icon = tb.icon;
              return (
                <NavLink
                  key={tb.to}
                  to={tb.to}
                  className={`group relative flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground
                    ${location.pathname === tb.to ? "border-b-3 border-accent" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {tb.label}
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t("common.slogan")}
      </footer>
    </div>
  );
}
