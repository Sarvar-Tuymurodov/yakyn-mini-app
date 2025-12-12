import { useNavigate } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { useUser } from "../hooks/useUser";
import { useTranslation } from "../hooks/useTranslation";
import { ContactCard } from "../components/ContactCard";
import { Button } from "../components/ui/Button";
import type { Language } from "../types";

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
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => navigate("/settings")}
          >
            <span>⚙️</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {!hasContacts ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-6">{t("home.noContacts")}</p>
            <Button onClick={() => navigate("/add")}>
              {t("home.addFirst")}
            </Button>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {overdueContacts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <span>⚠️</span> {t("home.overdue")}
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
                <h2 className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-1">
                  <span>🔔</span> {t("home.today")}
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
                <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <span>📋</span> {t("home.upcoming")}
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
          ➕ {t("add.title")}
        </Button>
      </div>
    </div>
  );
}
