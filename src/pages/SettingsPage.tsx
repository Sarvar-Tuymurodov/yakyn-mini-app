import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Card, CardContent } from "../components/ui/Card";
import type { Language } from "../types";

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
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg mr-3"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">⚙️ {t("settings.title")}</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🌐 {t("settings.language")}
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
                  🇷🇺 Русский
                </button>
                <button
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    language === "uz"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleLanguageChange("uz")}
                >
                  🇺🇿 O'zbekcha
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🕐 {t("settings.timezone")}
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
                    {t(`timezones.${tz}` as const)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-400 text-sm pt-8">
          <p>Yakyn v1.0.0</p>
          <p className="mt-1">Держи близких близко ❤️</p>
        </div>
      </main>
    </div>
  );
}
