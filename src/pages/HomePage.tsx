import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { contactsApi } from "../api/contacts";
import yakynLogo from "../assets/yakyn-logo.svg";
import { AddContactFAB } from "../components/AddContactFAB";
import { ContactCard } from "../components/ContactCard";
import { EmptyContactsState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { ContactListSkeleton } from "../components/ui/Skeleton";
import { UndoToast } from "../components/UndoToast";
import { useContacts } from "../hooks/useContacts";
import { useHaptic } from "../hooks/useHaptic";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useTranslation } from "../hooks/useTranslation";
import { useUser } from "../hooks/useUser";
import type { Language } from "../types";

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const ImportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Contact Picker API types
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

  // Pull-to-refresh
  const { isRefreshing, pullDistance, containerRef, handlers } = usePullToRefresh({
    onRefresh: async () => {
      haptic.tap();
      await refetch();
    },
  });

  // Local state
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [undoData, setUndoData] = useState<{
    contactId: number;
    contactName: string;
    previousState: {
      lastContactAt: string | null;
      nextReminderAt: string;
      snoozedUntil?: string | null;
    };
  } | null>(null);
  const [noteModalData, setNoteModalData] = useState<{
    contactId: number;
    contactName: string;
  } | null>(null);
  const [noteValue, setNoteValue] = useState("");

  // Filter contacts by search
  const filterContacts = useCallback((contacts: typeof overdueContacts) => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(c => c.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const filteredOverdue = filterContacts(overdueContacts);
  const filteredToday = filterContacts(todayContacts);
  const filteredUpcoming = filterContacts(upcomingContacts);

  const canImportContacts = "contacts" in navigator && !!navigator.contacts;

  const handleImportContacts = async () => {
    if (!navigator.contacts) return;

    try {
      setIsImporting(true);
      const contacts = await navigator.contacts.select(["name"], { multiple: true });

      if (contacts.length === 0) {
        setIsImporting(false);
        return;
      }

      const contactsToImport = contacts
        .filter((c) => c.name && c.name[0])
        .map((c) => ({ name: c.name[0] }));

      if (contactsToImport.length === 0) {
        setIsImporting(false);
        return;
      }

      const result = await contactsApi.importContacts(contactsToImport);
      setImportResult({ count: result.imported });
      await refetch();

      setTimeout(() => setImportResult(null), 3000);
    } catch (error) {
      console.error("Failed to import contacts:", error);
      if ((error as Error).name !== "InvalidStateError") {
        alert(language === "ru" ? "Не удалось импортировать контакты" : "Kontaktlarni import qilishda xatolik");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleQuickAction = (id: number, contactName: string) => {
    haptic.tap();
    setNoteValue("");
    setNoteModalData({ contactId: id, contactName });
  };

  const handleConfirmContacted = async (withNote: boolean) => {
    if (!noteModalData) return;
    const { contactId, contactName } = noteModalData;
    const note = withNote && noteValue.trim() ? noteValue.trim() : undefined;

    setNoteModalData(null);
    setNoteValue("");

    try {
      haptic.success();
      const result = await markContacted(contactId, note);
      if (result.previousState) {
        setUndoData({ contactId, contactName, previousState: result.previousState });
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

  const isLoading = userLoading || contactsLoading;
  const hasContacts = overdueContacts.length > 0 || todayContacts.length > 0 || upcomingContacts.length > 0;
  const hasFilteredResults = filteredOverdue.length > 0 || filteredToday.length > 0 || filteredUpcoming.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f] pb-24 overflow-hidden flex flex-col">
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

      {/* Search Bar */}
      {hasContacts && !isLoading && (
        <div className="px-4 pt-3 pb-1 bg-gray-50 dark:bg-[#1f1f1f]">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "ru" ? "Поиск контактов..." : "Kontaktlarni qidirish..."}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import Result Toast */}
      {importResult && (
        <div className="fixed top-16 left-4 right-4 z-20 animate-slide-down">
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg text-center font-medium">
            {language === "ru" ? `Импортировано контактов: ${importResult.count}` : `Import qilindi: ${importResult.count} ta kontakt`}
          </div>
        </div>
      )}

      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <div className={`flex items-center justify-center ${isRefreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${Math.min(pullDistance * 3, 360)}deg)` }}
        >
          <RefreshIcon />
        </div>
      </div>

      {/* Main Content */}
      <main
        ref={containerRef as React.RefObject<HTMLElement>}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
        {...handlers}
      >
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
                  <span>{language === "ru" ? "Импорт из телефона" : "Telefondan import"}</span>
                </button>
              )}
            </div>
          </div>
        ) : searchQuery && !hasFilteredResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <SearchIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {language === "ru" ? `Контакт "${searchQuery}" не найден` : `"${searchQuery}" kontakti topilmadi`}
            </p>
            <button onClick={() => setSearchQuery("")} className="mt-3 text-amber-600 dark:text-amber-500 font-medium">
              {language === "ru" ? "Очистить поиск" : "Qidiruvni tozalash"}
            </button>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {filteredOverdue.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">{t("home.overdue")}</h2>
                  <span className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                    {filteredOverdue.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredOverdue.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => navigate(`/contact/${contact.id}`)}
                      onQuickAction={() => handleQuickAction(contact.id, contact.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Today Section */}
            {filteredToday.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-amber-600">{t("home.today")}</h2>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                    {filteredToday.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredToday.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => navigate(`/contact/${contact.id}`)}
                      onQuickAction={() => handleQuickAction(contact.id, contact.name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Section */}
            {filteredUpcoming.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t("home.upcoming")}</h2>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {filteredUpcoming.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredUpcoming.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => navigate(`/contact/${contact.id}`)}
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

      {/* Contact Note Modal */}
      {noteModalData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {noteModalData.contactName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("contact.notePlaceholder")}</p>
            <textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder={language === "ru" ? "Обсудили новый проект..." : "Yangi loyiha haqida gaplashdik..."}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" fullWidth onClick={() => handleConfirmContacted(false)}>
                {language === "ru" ? "Пропустить" : "O'tkazib yuborish"}
              </Button>
              <Button fullWidth onClick={() => handleConfirmContacted(true)}>
                {t("contact.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact FAB */}
      <AddContactFAB language={language} />
    </div>
  );
}
