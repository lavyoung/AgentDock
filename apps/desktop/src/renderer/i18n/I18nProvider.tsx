import {type PropsWithChildren, useEffect, useState,} from "react";

import {type Locale, messages} from "./messages";
import {I18nContext, type I18nContextValue} from "./i18nContext";

const LOCALE_STORAGE_KEY = "agentdock.locale";

function detectInitialLocale(): Locale {
    if (typeof window === "undefined") {
        return "en";
    }

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale === "en" || storedLocale === "zh-CN") {
        return storedLocale;
    }

    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function I18nProvider({children}: PropsWithChildren): JSX.Element {
    const [locale, setLocale] = useState<Locale>(detectInitialLocale);

    useEffect(() => {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        document.documentElement.lang = locale;
    }, [locale]);

    const catalog = messages[locale];
    const value: I18nContextValue = {
        locale,
        setLocale,
        t(key) {
            return catalog[key];
        },
        formatDateTime(input) {
            return new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(new Date(input));
        },
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
