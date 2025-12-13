import type { Contact, Language } from "../types";
import { useTranslation } from "../hooks/useTranslation";

interface ContactCardProps {
  contact: Contact;
  language: Language;
  onClick?: () => void;
  onQuickAction?: () => void;
}

export function ContactCard({
  contact,
  language,
  onClick,
  onQuickAction,
}: ContactCardProps) {
  const { t } = useTranslation(language);

  const getStatusText = () => {
    if (contact.status === "overdue") {
      return t("contact.daysAgo", { days: Math.abs(contact.daysUntil) });
    }
    if (contact.status === "today") {
      return t("contact.todayAt", { time: contact.reminderTime });
    }
    return t("contact.inDays", { days: contact.daysUntil });
  };

  const getStatusColor = () => {
    switch (contact.status) {
      case "overdue":
        return "text-red-600";
      case "today":
        return "text-amber-600";
      default:
        return "text-gray-500";
    }
  };

  const getLastContactText = () => {
    if (!contact.lastContactAt) return null;
    const lastDate = new Date(contact.lastContactAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return language === "ru" ? "сегодня" : "bugun";
    if (diffDays === 1) return language === "ru" ? "вчера" : "kecha";
    return t("contact.daysAgo", { days: diffDays });
  };

  const lastContactText = getLastContactText();

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
        <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
        {lastContactText && (
          <p className="text-xs text-gray-400 mt-0.5">
            {t("contact.lastContact")}: {lastContactText}
          </p>
        )}
      </div>

      {onQuickAction && (
        <button
          className="ml-3 w-9 h-9 flex items-center justify-center bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction();
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
