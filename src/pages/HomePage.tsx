import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { contactsApi } from "../api/contacts";
import yakynLogo from "../assets/yakyn-logo.svg";
import { ContactCard } from "../components/ContactCard";
import { EmptyContactsState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { ContactListSkeleton } from "../components/ui/Skeleton";
import { UndoToast } from "../components/UndoToast";
import { useContacts } from "../hooks/useContacts";
import { useHaptic } from "../hooks/useHaptic";
import { useTranslation } from "../hooks/useTranslation";
import { useUser } from "../hooks/useUser";
import type { Language } from "../types";

// SVG Icons
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ImportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// TypeScript declaration for Contact Picker API
interface ContactPickerContact {
  name: string[];
  tel?: string[];
}

declare global {
  interface ContactsManager {
    select(properties: string[], options?: { multiple?: boolean }): Promise<ContactPickerContact[]>;
    getProperties(): Promise<string[]>;
  }
  interface Navigator {
    contacts?: ContactsManager;
  }
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const {
    overdueContacts,
    todayContacts,
    upcomingContacts,
    loading: contactsLoading,
    markContacted,
    undoMarkContacted,
    refetch,
  } = useContacts();

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);
  const haptic = useHaptic();

  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);
  const [undoData, setUndoData] = useState<{
    contactId: number;
    contactName: string;
    previousState: {
      lastContactAt: string | null;
      nextReminderAt: string;
      snoozedUntil?: string | null;
    };
  } | null>(null);

  // Check if Contact Picker API is available
  const canImportContacts = "contacts" in navigator && !!navigator.contacts;

  const handleContactClick = (id: number) => {
    navigate(`/contact/${id}`);
  };

  const handleQuickAction = async (id: number, contactName: string) => {
    try {
      haptic.success();
      const result = await markContacted(id);
      if (result.previousState) {
        setUndoData({
          contactId: id,
          contactName,
          previousState: result.previousState,
        });
      }
    } catch (error) {
      haptic.error();
      console.error("Failed to mark contacted:", error);
    }
  };

  const handleUndo = async () => {
    if (!undoData) return;
    try {
      await undoMarkContacted(undoData.contactId, undoData.previousState);
      setUndoData(null);
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  };

  const handleImportContacts = async () => {
    if (!navigator.contacts) return;

    try {
      setIsImporting(true);
      const contacts = await navigator.contacts.select(["name"], {
        multiple: true,
      });

      if (contacts.length === 0) {
        setIsImporting(false);
        return;
      }

      // Map contacts to our format
      const contactsToImport = contacts
        .filter((c) => c.name && c.name[0])
        .map((c) => ({
          name: c.name[0],
        }));

      if (contactsToImport.length === 0) {
        setIsImporting(false);
        return;
      }

      const result = await contactsApi.importContacts(contactsToImport);
      setImportResult({ count: result.imported });
      await refetch();

      // Clear result after 3 seconds
      setTimeout(() => setImportResult(null), 3000);
    } catch (error) {
      console.error("Failed to import contacts:", error);
      if ((error as Error).name !== "InvalidStateError") {
        alert(
          language === "ru"
            ? "Не удалось импортировать контакты"
            : "Kontaktlarni import qilishda xatolik"
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  const isLoading = userLoading || contactsLoading;

  const hasContacts =
    overdueContacts.length > 0 ||
    todayContacts.length > 0 ||
    upcomingContacts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#2d2d2d] border-b border-gray-100 dark:border-[#404040] px-4 py-3 tg-safe-top">
        <div className="flex items-center justify-between">
          <img src={yakynLogo} alt="Yakyn" className="w-7 h-7" />
          <div className="flex items-center gap-1">
            {canImportContacts && (
              <button
                className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#404040] rounded-full transition-colors disabled:opacity-50"
                onClick={handleImportContacts}
                disabled={isImporting}
                title={language === "ru" ? "Импорт контактов" : "Kontaktlarni import qilish"}
              >
                {isImporting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <ImportIcon />
                )}
              </button>
            )}
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#404040] rounded-full transition-colors"
              onClick={() => navigate("/settings")}
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Import Result Toast */}
      {importResult && (
        <div className="fixed top-16 left-4 right-4 z-20 animate-slide-down">
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg text-center font-medium">
            {language === "ru"
              ? `Импортировано контактов: ${importResult.count}`
              : `Import qilindi: ${importResult.count} ta kontakt`}
          </div>
        </div>
      )}

      <main className="px-4 py-4 space-y-5">
        {isLoading ? (
          <ContactListSkeleton />
        ) : !hasContacts ? (
          <div className="flex flex-col items-center justify-center text-center">
            <EmptyContactsState language={language} />
            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
              <Button onClick={() => navigate("/add")} fullWidth>
                {t("home.addFirst")}
              </Button>
              {canImportContacts && (
                <button
                  onClick={handleImportContacts}
                  disabled={isImporting}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 rounded-xl font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
                >
                  {isImporting ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <ImportIcon />
                  )}
                  <span>
                    {language === "ru" ? "Импорт из телефона" : "Telefondan import"}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {overdueContacts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {t("home.overdue")}
                  </h2>
                  <span className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                    {overdueContacts.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {overdueContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id, contact.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Today Section */}
            {todayContacts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-amber-600">
                    {t("home.today")}
                  </h2>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                    {todayContacts.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {todayContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id, contact.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Section */}
            {upcomingContacts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {t("home.upcoming")}
                  </h2>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {upcomingContacts.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {upcomingContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id, contact.name)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Undo Toast */}
      {undoData && (
        <UndoToast
          contactName={undoData.contactName}
          language={language}
          onUndo={handleUndo}
          onDismiss={() => setUndoData(null)}
        />
      )}

      {/* Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 active:bg-amber-700 active:scale-95 transition-all flex items-center justify-center tg-margin-bottom"
        onClick={() => navigate("/add")}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
