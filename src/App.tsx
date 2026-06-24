import { useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { I18nProvider } from './providers/I18nProvider';
import { RoutesConfig } from './routes';

export default function App() {
  useEffect(() => {
    const handleExtensionMessage = (event: any) => {
      // Bảo mật ATTT: Chỉ nhận dữ liệu đúng nguồn từ Extension Bridge của bạn
      if (event.data && event.data.source === "EXTENSION_BRIDGE") {
        if (event.data.action === "SYNC_DATA") {
          console.log("Đã nhận dữ liệu điểm từ Extension:", event.data.data);
        }
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  return (
    <>
      <I18nProvider>
        <RoutesConfig />
        <Toaster
          theme="system"
          position="top-right"
          expand
          visibleToasts={5}
          mobileOffset={{ top: "16px", right: "16px" }}
          richColors={true}
          toastOptions={{
            duration: 3000,
            // style: {
            //   borderRadius: "8px",
            //   background: "#ccc",
            //   color: "#fff",
            // },
          }}
        />
      </I18nProvider>
    </>
  )
}