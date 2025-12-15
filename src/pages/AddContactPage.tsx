import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Button } from "../components/ui/Button";
import type { Frequency, Language } from "../types";

// SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly"];
const TIMES = ["08:00", "09:00", "10:00", "12:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

export function AddContactPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createContact } = useContacts();

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [reminderTime, setReminderTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createContact(
        name.trim(),
        frequency,
        reminderTime,
        notes.trim() || undefined,
        birthday || undefined
      );
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setLoading(false);
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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("add.title")}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-32">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("add.namePlaceholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
            autoFocus
          />
        </div>

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.frequency")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  frequency === freq
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#404040] hover:border-amber-300"
                }`}
                onClick={() => setFrequency(freq)}
              >
                {t(`frequencies.${freq}` as const)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.time")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((timeOption) => (
              <button
                key={timeOption}
                type="button"
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  reminderTime === timeOption
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#404040] hover:border-amber-300"
                }`}
                onClick={() => setReminderTime(timeOption)}
              >
                {timeOption}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.notes")} <span className="text-gray-400 dark:text-gray-500 font-normal">{t("add.birthdayOptional")}</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("add.notesPlaceholder")}
            className="w-full px-4 py-3 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
            rows={3}
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.birthday")} <span className="text-gray-400 dark:text-gray-500 font-normal">{t("add.birthdayOptional")}</span>
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full max-w-full px-4 py-3 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none"
            style={{ WebkitAppearance: "none" }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Spacer for fixed button */}
      </form>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#2d2d2d] border-t border-gray-100 dark:border-[#404040] tg-safe-bottom">
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading || !name.trim()}
          onClick={handleSubmit}
        >
          {loading ? t("common.loading") : t("add.save")}
        </Button>
      </div>
    </div>
  );
}
