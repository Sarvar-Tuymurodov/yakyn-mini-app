import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contactsApi } from "../api/contacts";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { Contact, Frequency, Language } from "../types";

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly", "quarterly"];
const TIMES = ["08:00", "09:00", "10:00", "12:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

export function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { markContacted, updateContact, deleteContact } = useContacts();

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg mr-3"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
            <h1 className="text-lg font-semibold">👤 {contact.name}</h1>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑
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
          </CardContent>
        </Card>

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔔 {t("add.frequency")}
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
            ⏰ {t("add.time")}
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
          ✅ {t("contact.contacted")}
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
