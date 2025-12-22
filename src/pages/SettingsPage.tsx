import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Card, CardContent } from "../components/ui/Card";
import type { Language } from "../types";

// SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TIMEZONES = ["UTC+3", "UTC+5", "UTC+6"];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateLanguage, updateTimezone } = useUser();
  const [savingLang, setSavingLang] = useState(false);
  const [savingTz, setSavingTz] = useState(false);

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);


  const handleLanguageChange = async (lang: Language) => {
    if (savingLang || lang === language) return;
    setSavingLang(true);
    try {
      await updateLanguage(lang);
    } catch (error) {
      console.error("Failed to update language:", error);
    } finally {
      setSavingLang(false);
    }
  };

  const handleTimezoneChange = async (tz: string) => {
    if (savingTz || tz === user?.timezone) return;
    setSavingTz(true);
    try {
      await updateTimezone(tz);
    } catch (error) {
      console.error("Failed to update timezone:", error);
    } finally {
      setSavingTz(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#2d2d2d] border-b border-gray-100 dark:border-[#404040] px-4 py-3 tg-safe-top">
        <div className="flex items-center">
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#404040] rounded-lg mr-3"
            onClick={() => navigate(-1)}
          >
            <BackIcon />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <SettingsIcon /> {t("settings.title")}
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <GlobeIcon /> {t("settings.language")}
          </label>
          <Card>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={savingLang}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                    language === "ru"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 dark:bg-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#505050]"
                  }`}
                  onClick={() => handleLanguageChange("ru")}
                >
                  Русский
                </button>
                <button
                  disabled={savingLang}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                    language === "uz"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 dark:bg-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#505050]"
                  }`}
                  onClick={() => handleLanguageChange("uz")}
                >
                  O'zbekcha
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <ClockIcon /> {t("settings.timezone")}
          </label>
          <Card>
            <CardContent className="p-2">
              <div className="space-y-2">
                {TIMEZONES.map((tz) => (
                  <button
                    key={tz}
                    disabled={savingTz}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors disabled:opacity-50 ${
                      user?.timezone === tz
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 dark:bg-[#404040] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#505050]"
                    }`}
                    onClick={() => handleTimezoneChange(tz)}
                  >
                    {t(`timezones.${tz}` as "timezones.UTC+3")}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm pt-8">
          <p>Yakyn v1.0.0</p>
          <p className="mt-1">Держи близких близко</p>
        </div>
      </main>
    </div>
  );
}
