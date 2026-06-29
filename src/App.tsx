import './App.css';
import { Toaster } from './components/ui/sonner';
import { I18nProvider } from './providers/I18nProvider';
import { RoutesConfig } from './routes';
import { Analytics } from "@vercel/analytics/next"

export default function App() {
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
        <Analytics />
      </I18nProvider>
    </>
  )
}