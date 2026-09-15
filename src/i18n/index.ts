import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { cs } from "./locales/cs";

export const languages = [
  { code: "en", label: "English", short: "EN", flag: "gb" },
  { code: "cs", label: "Čeština", short: "CZ", flag: "cz" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

const languageCodes: readonly string[] = languages.map((language) => language.code);

function getInitialLanguage(): LanguageCode {
  const stored = localStorage.getItem("language");
  if (stored && languageCodes.includes(stored)) {
    return stored as LanguageCode;
  }

  const preferred = navigator.language?.slice(0, 2);
  if (preferred && languageCodes.includes(preferred)) {
    return preferred as LanguageCode;
  }

  return "en";
}

const initialLanguage = getInitialLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    cs: { translation: cs },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = initialLanguage;

export function changeLanguage(code: LanguageCode) {
  void i18n.changeLanguage(code);
  localStorage.setItem("language", code);
  document.documentElement.lang = code;
}

export default i18n;
