import {createContext} from "react";

import {type Locale, messages} from "./messages";

export type I18nContextValue = {
    locale: Locale;
    setLocale(locale: Locale): void;
    t(key: keyof (typeof messages)["en"]): string;
    formatDateTime(value: string): string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
