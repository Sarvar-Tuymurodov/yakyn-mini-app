import { useNavigate } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { ContactCard } from "../components/ContactCard";
import { Button } from "../components/ui/Button";
import type { Language } from "../types";

// SVG Icons
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export function HomePage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const {
    overdueContacts,
    todayContacts,
    upcomingContacts,
    loading: contactsLoading,
    markContacted,
  } = useContacts();

  const language = (user?.language ?? "ru") as Language;
  const { t } = useTranslation(language);

  const handleContactClick = (id: number) => {
    navigate(`/contact/${id}`);
  };

  const handleQuickAction = async (id: number) => {
    try {
      await markContacted(id);
    } catch (error) {
      console.error("Failed to mark contacted:", error);
    }
  };

  if (userLoading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  const hasContacts =
    overdueContacts.length > 0 ||
    todayContacts.length > 0 ||
    upcomingContacts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-600">Yakyn</h1>
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {!hasContacts ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <InboxIcon />
            <p className="text-gray-500 mt-4 mb-6">{t("home.noContacts")}</p>
            <Button onClick={() => navigate("/add")}>
              {t("home.addFirst")}
            </Button>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {overdueContacts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1.5">
                  <AlertIcon /> {t("home.overdue")}
                </h2>
                <div className="space-y-2">
                  {overdueContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Today Section */}
            {todayContacts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-1.5">
                  <BellIcon /> {t("home.today")}
                </h2>
                <div className="space-y-2">
                  {todayContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Section */}
            {upcomingContacts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <ListIcon /> {t("home.upcoming")}
                </h2>
                <div className="space-y-2">
                  {upcomingContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      language={language}
                      onClick={() => handleContactClick(contact.id)}
                      onQuickAction={() => handleQuickAction(contact.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Fixed Add Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <Button fullWidth size="lg" onClick={() => navigate("/add")}>
          {t("add.title")}
        </Button>
      </div>
    </div>
  );
}
