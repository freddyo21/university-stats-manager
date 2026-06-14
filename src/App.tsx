import './App.css'
import { I18nProvider } from './lib/academic/i18n'
import { RoutesConfig } from './routes'

export default function App() {

  return (
    <>
      <I18nProvider>
        <RoutesConfig />
      </I18nProvider>
    </>
  )
}