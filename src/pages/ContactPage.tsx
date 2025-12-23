import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contactsApi } from "../api/contacts";
import { aiApi } from "../api/ai";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useContacts } from "../hooks/useContacts";
import { useTranslation } from "../hooks/useTranslation";
import { useUser } from "../hooks/useUser";
import { useHaptic } from "../hooks/useHaptic";
import type { Contact, Frequency, Language, ContactHistoryEntry } from "../types";

// SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CakeIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546V12a4 4 0 014-4h10a4 4 0 014 4v3.546zM12 4v4m-4-4v4m8-4v4" />
  </svg>
);

const SnoozeIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly"];
const TIMES = ["08:00", "09:00", "10:00", "12:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

export function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { markContacted, updateContact, deleteContact, snoozeContact } = useContacts();

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);
  const haptic = useHaptic();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [birthdayValue, setBirthdayValue] = useState("");
  const [notesValue, setNotesValue] = useState("");

  // AI suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Contact history state
  const [history, setHistory] = useState<ContactHistoryEntry[]>([]);

  // Contact note modal state
  const [showContactedModal, setShowContactedModal] = useState(false);
  const [contactedNoteValue, setContactedNoteValue] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const voiceButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchContact() {
      if (!id) return;
      try {
        const [contactRes, historyRes] = await Promise.all([
          contactsApi.getById(parseInt(id)),
          contactsApi.getHistory(parseInt(id)),
        ]);
        setContact(contactRes.contact);
        setHistory(historyRes.history);
      } catch (error) {
        console.error("Failed to fetch contact:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [id]);

  const handleMarkContactedClick = () => {
    haptic.tap();
    setContactedNoteValue("");
    setShowContactedModal(true);
  };

  const handleConfirmContacted = async (withNote: boolean) => {
    if (!contact) return;
    const note = withNote && contactedNoteValue.trim() ? contactedNoteValue.trim() : undefined;

    setShowContactedModal(false);
    setContactedNoteValue("");

    try {
      haptic.success();
      const { contact: updated } = await markContacted(contact.id, note);
      setContact(updated);
      // Refresh history
      const historyRes = await contactsApi.getHistory(contact.id);
      setHistory(historyRes.history);
    } catch (error) {
      haptic.error();
      console.error("Failed to mark contacted:", error);
    }
  };

  const handleFrequencyChange = async (freq: Frequency) => {
    if (!contact) return;
    try {
      const updated = await updateContact(contact.id, { frequency: freq });
      setContact(updated);
    } catch (error) {
      console.error("Failed to update frequency:", error);
    }
  };

  const handleTimeChange = async (time: string) => {
    if (!contact) return;
    try {
      const updated = await updateContact(contact.id, { reminderTime: time });
      setContact(updated);
    } catch (error) {
      console.error("Failed to update time:", error);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    try {
      haptic.warning();
      await deleteContact(contact.id);
      navigate("/");
    } catch (error) {
      haptic.error();
      console.error("Failed to delete contact:", error);
    }
  };

  const handleSnooze = async (hours: number | "tomorrow") => {
    if (!contact) return;
    try {
      const updated = await snoozeContact(contact.id, hours);
      setContact(updated);
    } catch (error) {
      console.error("Failed to snooze:", error);
    }
  };

  const handleEditBirthday = () => {
    setBirthdayValue(contact?.birthday ? contact.birthday.split("T")[0] : "");
    setEditingBirthday(true);
  };

  const handleSaveBirthday = async () => {
    if (!contact) return;
    try {
      const updated = await updateContact(contact.id, {
        birthday: birthdayValue || null,
      });
      setContact(updated);
      setEditingBirthday(false);
    } catch (error) {
      console.error("Failed to update birthday:", error);
    }
  };

  const handleEditNotes = () => {
    setNotesValue(contact?.notes || "");
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!contact) return;
    try {
      const updated = await updateContact(contact.id, {
        notes: notesValue || null,
      });
      setContact(updated);
      setEditingNotes(false);
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  // AI Suggestions handlers
  const handleGetSuggestions = async () => {
    if (!contact) return;
    setShowSuggestions(true);
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const response = await aiApi.getSuggestions(contact.id);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      setSuggestions([
        language === "ru"
          ? "Не удалось получить подсказки. Попробуйте позже."
          : "Takliflarni olishda xatolik. Keyinroq urinib ko'ring."
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCopySuggestion = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Voice recording handlers - Press and hold to record (like Telegram)
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      haptic.tap();
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
      haptic.tap();
    }
  };

  // Handle pointer events for press-and-hold
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

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const response = await aiApi.transcribeAudio(base64);
        if (response.text) {
          setNotesValue(prev => prev ? `${prev}\n${response.text}` : response.text);
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error("Failed to transcribe:", error);
      setIsTranscribing(false);
    }
  };

  // Attach non-passive touch event listeners for voice button
  useEffect(() => {
    const button = voiceButtonRef.current;
    if (!button || !editingNotes) return;

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
  }, [editingNotes, isRecording, isTranscribing]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-[#1f1f1f]">
        <svg className="w-12 h-12 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#1f1f1f]">
        <div className="text-gray-500 dark:text-gray-400">Contact not found</div>
      </div>
    );
  }

  const monthsRu = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const monthsUz = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("contact.never");
    const date = new Date(dateStr);
    const day = date.getDate();
    const year = date.getFullYear();
    const months = language === "ru" ? monthsRu : monthsUz;
    const month = months[date.getMonth()];
    return `${day} ${month} ${year}`;
  };

  const formatBirthday = (dateStr: string | null) => {
    if (!dateStr) return t("contact.noBirthday");
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = language === "ru" ? monthsRu : monthsUz;
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#2d2d2d] border-b border-gray-100 dark:border-[#404040] px-4 py-3 tg-safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#404040] rounded-lg mr-3"
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{contact.name}</h1>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Info Card */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("contact.lastContact")}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(contact.lastContactAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("contact.nextReminder")}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(contact.nextReminderAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400"><CakeIcon /> {t("contact.birthday")}</span>
              {contact.birthday ? (
                <button
                  className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                  onClick={handleEditBirthday}
                >
                  {formatBirthday(contact.birthday)}
                  <EditIcon />
                </button>
              ) : (
                <button
                  className="text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm"
                  onClick={handleEditBirthday}
                >
                  {language === "ru" ? "указать" : "Belgilash"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <NoteIcon /> {t("contact.notes")}
              </span>
              <button
                className="text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                onClick={handleEditNotes}
              >
                <EditIcon />
              </button>
            </div>
            {contact.notes ? (
              <p className="text-gray-700 dark:text-gray-300">{contact.notes}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic text-sm">{t("add.notesPlaceholder")}</p>
            )}
          </CardContent>
        </Card>

        {/* Contact History */}
        {history.length > 0 && (
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  <HistoryIcon /> {language === "ru" ? "История связи" : "Aloqa tarixi"}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {history.length} {language === "ru" ? "раз" : "marta"}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 10).map((entry) => {
                  const date = new Date(entry.createdAt);
                  const day = date.getDate();
                  const months = language === "ru"
                    ? ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
                    : ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
                  const month = months[date.getMonth()];
                  const year = date.getFullYear();
                  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-600 dark:text-gray-400">
                          {day} {month} {year}, {time}
                        </div>
                        {entry.note && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-0.5 truncate">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions Button */}
        <button
          onClick={handleGetSuggestions}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:from-violet-600 hover:to-purple-700 active:scale-[0.98] transition-all"
        >
          <SparklesIcon />
          <span>{language === "ru" ? "Что написать?" : "Nima yozish kerak?"}</span>
        </button>

        {/* Snooze Options */}
        {(contact.status === "overdue" || contact.status === "today") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <SnoozeIcon /> {t("contact.snooze")}
            </label>
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500 transition-colors"
                onClick={() => handleSnooze(1)}
              >
                {t("contact.snooze1h")}
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500 transition-colors"
                onClick={() => handleSnooze(3)}
              >
                {t("contact.snooze3h")}
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500 transition-colors"
                onClick={() => handleSnooze("tomorrow")}
              >
                {t("contact.snoozeTomorrow")}
              </button>
            </div>
          </div>
        )}

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <BellIcon /> {t("add.frequency")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  contact.frequency === freq
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#404040] hover:border-amber-300 dark:hover:border-amber-500"
                }`}
                onClick={() => handleFrequencyChange(freq)}
              >
                {t(`frequencies.${freq}` as const)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <ClockIcon /> {t("add.time")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((tm) => (
              <button
                key={tm}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  contact.reminderTime === tm
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#404040] hover:border-amber-300 dark:hover:border-amber-500"
                }`}
                onClick={() => handleTimeChange(tm)}
              >
                {tm}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Action Button */}
      <div className="fixed bottom-4 left-4 right-4 tg-margin-bottom">
        <Button fullWidth size="lg" onClick={handleMarkContactedClick}>
          <CheckIcon /> {t("contact.contacted")}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("contact.confirmDelete", { name: contact.name })}
            </h2>
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button variant="danger" fullWidth onClick={handleDelete}>
                {t("contact.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Birthday Modal */}
      {editingBirthday && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              <CakeIcon /> {t("contact.birthday")}
            </h2>
            <input
              type="date"
              value={birthdayValue}
              onChange={(e) => setBirthdayValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setEditingBirthday(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button fullWidth onClick={handleSaveBirthday}>
                {t("contact.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingNotes && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              <NoteIcon /> {t("contact.notes")}
            </h2>
            <div className="relative">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder={t("add.notesPlaceholder")}
                rows={6}
                className="w-full px-4 py-3 pr-24 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 resize-y"
              />
              {/* Voice Recording Button - Press and hold to record (Telegram style) */}
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
                  /* Recording state - Pulsing mic with audio rings */
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
                    {/* Recording indicator */}
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 active:scale-110 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setEditingNotes(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button fullWidth onClick={handleSaveNotes}>
                {t("contact.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showSuggestions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-5 w-full animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <SparklesIcon />
                {language === "ru" ? "Что написать?" : "Nima yozish kerak?"}
              </h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#404040] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingSuggestions ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <svg className="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400">
                  {language === "ru" ? "Генерирую идеи..." : "G'oyalar yaratilmoqda..."}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-[#404040]"
                  >
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      {suggestion}
                    </p>
                    <button
                      onClick={() => handleCopySuggestion(suggestion, index)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        copiedIndex === index
                          ? "text-green-500"
                          : "text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      }`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <CheckIcon />
                          {language === "ru" ? "Скопировано!" : "Nusxalandi!"}
                        </>
                      ) : (
                        <>
                          <CopyIcon />
                          {language === "ru" ? "Скопировать" : "Nusxalash"}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowSuggestions(false)}
              >
                {t("common.close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contacted Note Modal */}
      {showContactedModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {contact?.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t("contact.notePlaceholder")}
            </p>
            <textarea
              value={contactedNoteValue}
              onChange={(e) => setContactedNoteValue(e.target.value)}
              placeholder={language === "ru" ? "Обсудили новый проект..." : "Yangi loyiha haqida gaplashdik..."}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => handleConfirmContacted(false)}
              >
                {language === "ru" ? "Пропустить" : "O'tkazib yuborish"}
              </Button>
              <Button fullWidth onClick={() => handleConfirmContacted(true)}>
                {t("contact.save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
