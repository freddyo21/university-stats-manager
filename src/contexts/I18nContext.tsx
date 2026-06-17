import type { I18nContextType } from "@/types/interfaces/i18n";
import { createContext } from "react";

export const I18nContext = createContext<I18nContextType | null>(null);