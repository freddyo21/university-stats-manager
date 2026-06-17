import './App.css';
import { I18nProvider } from './providers/I18nProvider';
import { RoutesConfig } from './routes';

export default function App() {

  return (
    <>
      <I18nProvider>
        <RoutesConfig />
      </I18nProvider>
    </>
  )
}