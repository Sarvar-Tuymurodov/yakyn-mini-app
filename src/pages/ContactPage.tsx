import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contactsApi } from "../api/contacts";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { Contact, Frequency, Language } from "../types";

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

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly"];
const TIMES = ["08:00", "09:00", "10:00", "12:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

export function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { markContacted, updateContact, deleteContact, snoozeContact } = useContacts();

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchContact() {
      if (!id) return;
      try {
        const response = await contactsApi.getById(parseInt(id));
        setContact(response.contact);
      } catch (error) {
        console.error("Failed to fetch contact:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, [id]);

  const handleMarkContacted = async () => {
    if (!contact) return;
    try {
      const updated = await markContacted(contact.id);
      setContact(updated);
    } catch (error) {
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
      await deleteContact(contact.id);
      navigate("/");
    } catch (error) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Contact not found</div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("contact.never");
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "uz-UZ", {
      day: "numeric",
      month: "long",
    });
  };

  const formatBirthday = (dateStr: string | null) => {
    if (!dateStr) return t("contact.noBirthday");
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "uz-UZ", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg mr-3"
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{contact.name}</h1>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
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
              <span className="text-gray-500">{t("contact.lastContact")}</span>
              <span className="font-medium">{formatDate(contact.lastContactAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("contact.nextReminder")}</span>
              <span className="font-medium">{formatDate(contact.nextReminderAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500"><CakeIcon /> {t("contact.birthday")}</span>
              <span className="font-medium">{formatBirthday(contact.birthday)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {contact.notes && (
          <Card>
            <CardContent>
              <div className="text-sm text-gray-500 mb-1">
                <NoteIcon /> {t("contact.notes")}
              </div>
              <p className="text-gray-700">{contact.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Snooze Options */}
        {(contact.status === "overdue" || contact.status === "today") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SnoozeIcon /> {t("contact.snooze")}
            </label>
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-amber-300 transition-colors"
                onClick={() => handleSnooze(1)}
              >
                {t("contact.snooze1h")}
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-amber-300 transition-colors"
                onClick={() => handleSnooze(3)}
              >
                {t("contact.snooze3h")}
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-amber-300 transition-colors"
                onClick={() => handleSnooze("tomorrow")}
              >
                {t("contact.snoozeTomorrow")}
              </button>
            </div>
          </div>
        )}

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BellIcon /> {t("add.frequency")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  contact.frequency === freq
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon /> {t("add.time")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((tm) => (
              <button
                key={tm}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  contact.reminderTime === tm
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
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
      <div className="fixed bottom-4 left-4 right-4">
        <Button fullWidth size="lg" onClick={handleMarkContacted}>
          <CheckIcon /> {t("contact.contacted")}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">
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
    </div>
  );
}
