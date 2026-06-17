export type Lang = "en" | "vi";

export interface LocaleTranslation {
  en: string;
  vi: string;
}

export interface Dict {
  [key: string]: LocaleTranslation;
}

export interface ReplaceOptions {
  [key: string]: string | number;
}

export interface I18nContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string | number, replaceOptions?: ReplaceOptions | undefined) => string;
};