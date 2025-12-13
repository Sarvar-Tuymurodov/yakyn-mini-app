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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);

  const handleLanguageChange = async (lang: Language) => {
    try {
      await updateLanguage(lang);
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  const handleTimezoneChange = async (tz: string) => {
    try {
      await updateTimezone(tz);
    } catch (error) {
      console.error("Failed to update timezone:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center">
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg mr-3"
            onClick={() => navigate(-1)}
          >
            <BackIcon />
          </button>
          <h1 className="text-lg font-semibold flex items-center">
            <SettingsIcon /> {t("settings.title")}
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GlobeIcon /> {t("settings.language")}
          </label>
          <Card>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    language === "ru"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleLanguageChange("ru")}
                >
                  Русский
                </button>
                <button
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    language === "uz"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon /> {t("settings.timezone")}
          </label>
          <Card>
            <CardContent className="p-2">
              <div className="space-y-2">
                {TIMEZONES.map((tz) => (
                  <button
                    key={tz}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                      user?.timezone === tz
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
        <div className="text-center text-gray-400 text-sm pt-8">
          <p>Yakyn v1.0.0</p>
          <p className="mt-1">Держи близких близко</p>
        </div>
      </main>
    </div>
  );
}
