import { Outlet } from "react-router-dom";
import { useI18n } from "@/i18n/use-i18n";
import { useEffect } from "react";
import { mergeAcademicStateFromExtension } from "@/lib/academic/store";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";

export function Layout() {
  const { t } = useI18n();

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      // Chỉ nhận dữ liệu từ cùng một nguồn với trang web
      if (event.origin !== window.location.origin) {
        console.warn("Tin nhắn không hợp lệ từ nguồn khác:", event.origin);
        return;
      }

      // Chỉ nhận dữ liệu đúng nguồn từ Extension Bridge
      if (event.data && event.data.source === "EXTENSION_BRIDGE") {
        if (event.data.action === "SYNC_DATA") {
          const receivedData = event.data.data;

          console.log("Đã nhận dữ liệu điểm từ Extension:", receivedData);
          console.log("Origin:", event.origin);

          if (receivedData && receivedData.data) {
            mergeAcademicStateFromExtension(receivedData.data);
          }
        }
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, [mergeAcademicStateFromExtension]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        {t("common.slogan")}
      </footer>

      <Footer />
    </div>
  );
}
