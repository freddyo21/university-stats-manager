import type { I18nContextType } from "@/i18n/i18n-types";
import { createContext } from "react";

export const I18nContext = createContext<I18nContextType | null>(null);