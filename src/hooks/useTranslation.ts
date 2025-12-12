import { useCallback } from "react";
import ru from "../locales/ru.json";
import uz from "../locales/uz.json";
import type { Language } from "../types";

type NestedKeyOf<T extends object> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & (string | number)];

type TranslationKey = NestedKeyOf<typeof ru>;

const locales: Record<Language, typeof ru> = { ru, uz };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof result === "string" ? result : path;
}

export function useTranslation(language: Language) {
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = getNestedValue(locales[language], key);

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
        });
      }

      return text;
    },
    [language]
  );

  return { t, language };
}
