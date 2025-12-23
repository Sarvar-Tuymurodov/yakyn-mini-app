import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Button } from "../components/ui/Button";
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

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const voiceButtonRef = useRef<HTMLButtonElement>(null);

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

  // Voice recording handlers - Press and hold to record
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyser for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualization loop - get single volume level
      const updateLevels = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Get average volume level (0-100)
        const avg = (dataArray[1] + dataArray[2] + dataArray[3] + dataArray[4] + dataArray[5]) / 5;
        const level = Math.min(100, (avg / 255) * 100 * 1.5);
        setAudioLevels([level, 0, 0, 0, 0]);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Only transcribe if recording lasted more than 0.5 seconds
        if (audioBlob.size > 1000) {
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert(language === "ru"
        ? "Не удалось получить доступ к микрофону"
        : "Mikrofonga ruxsat olinmadi");
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels([0, 0, 0, 0, 0]);

    // Clean up stream and audio context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Press and hold handlers
  const handleRecordStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isRecording && !isTranscribing) {
      startRecording();
    }
  };

  const handleRecordEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  // Attach non-passive touch event listeners
  useEffect(() => {
    const button = voiceButtonRef.current;
    if (!button) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!isRecording && !isTranscribing) {
        startRecording();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (isRecording) {
        stopRecording();
      }
    };

    button.addEventListener("touchstart", handleTouchStart, { passive: false });
    button.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      button.removeEventListener("touchstart", handleTouchStart);
      button.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRecording, isTranscribing]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const response = await aiApi.transcribeAudio(base64);
        if (response.text) {
          setNotes(prev => prev ? `${prev}\n${response.text}` : response.text);
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error("Failed to transcribe:", error);
      setIsTranscribing(false);
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
            {/* Voice Recording Button - Press and hold (Telegram style) */}
            <button
              ref={voiceButtonRef}
              type="button"
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordEnd}
              onMouseLeave={handleRecordEnd}
              disabled={isTranscribing}
              className="absolute top-2 right-2 transition-all touch-none select-none"
            >
              {isRecording ? (
                /* Recording state - Mic with live audio rings */
                <div className="relative flex items-center justify-center w-14 h-14">
                  {/* Live audio rings - Telegram style */}
                  <div
                    className="absolute rounded-full bg-red-500/10"
                    style={{
                      width: `${44 + audioLevels[0] * 0.5}px`,
                      height: `${44 + audioLevels[0] * 0.5}px`,
                      transition: 'all 50ms ease-out',
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-red-500/20"
                    style={{
                      width: `${40 + audioLevels[0] * 0.35}px`,
                      height: `${40 + audioLevels[0] * 0.35}px`,
                      transition: 'all 50ms ease-out',
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-red-500/30"
                    style={{
                      width: `${36 + audioLevels[0] * 0.2}px`,
                      height: `${36 + audioLevels[0] * 0.2}px`,
                      transition: 'all 50ms ease-out',
                    }}
                  />
                  {/* Recording mic icon */}
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                </div>
              ) : isTranscribing ? (
                /* Transcribing state - Animated waves */
                <div className="relative flex items-center justify-center w-14 h-14">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <div className="flex items-end gap-1 h-4">
                      <div className="w-1 bg-white rounded-full animate-sound-wave-1" />
                      <div className="w-1 bg-white rounded-full animate-sound-wave-2" />
                      <div className="w-1 bg-white rounded-full animate-sound-wave-3" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Default state - Mic button */
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all active:scale-95">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
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
