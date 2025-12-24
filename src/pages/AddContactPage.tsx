import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { Button } from "../components/ui/Button";
import { VoiceRecordButton } from "../components/VoiceRecordButton";
import { aiApi } from "../api/ai";
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
  const [searchParams] = useSearchParams();
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

  // Pre-fill from URL params (voice-to-contact)
  useEffect(() => {
    const nameParam = searchParams.get("name");
    const frequencyParam = searchParams.get("frequency") as Frequency | null;
    const notesParam = searchParams.get("notes");
    const birthdayParam = searchParams.get("birthday");

    if (nameParam) setName(nameParam);
    if (frequencyParam && FREQUENCIES.includes(frequencyParam)) setFrequency(frequencyParam);
    if (notesParam) setNotes(notesParam);
    if (birthdayParam) setBirthday(birthdayParam);
  }, [searchParams]);

  // Voice recording with transcription
  const handleTranscribe = useCallback(async (audioBlob: Blob) => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(audioBlob);
    });
    const response = await aiApi.transcribeAudio(base64);
    if (response.text) {
      setNotes(prev => prev ? `${prev}\n${response.text}` : response.text);
    }
  }, []);

  const {
    isRecording,
    isProcessing: isTranscribing,
    audioLevel,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
  } = useVoiceRecording({ onTranscribe: handleTranscribe });

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

  const voiceState = isRecording ? "recording" : isTranscribing ? "transcribing" : "idle";

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
            className="w-full px-4 py-3 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
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

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.birthday")} <span className="text-gray-400 dark:text-gray-500 font-normal">{t("add.birthdayOptional")}</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>
              </svg>
            </div>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Notes with Voice Recording */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("add.notes")} <span className="text-gray-400 dark:text-gray-500 font-normal">{t("add.birthdayOptional")}</span>
          </label>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("add.notesPlaceholder")}
              className="w-full px-4 py-3 pr-16 border border-gray-200 dark:border-[#404040] rounded-xl bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
              rows={3}
            />
            <div className="absolute top-2 right-2">
              <VoiceRecordButton
                state={voiceState}
                size="sm"
                audioLevel={audioLevel}
                hasPermission={hasPermission}
                onRequestPermission={requestPermission}
                onRecordStart={startRecording}
                onRecordEnd={stopRecording}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
            {error}
          </div>
        )}
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
