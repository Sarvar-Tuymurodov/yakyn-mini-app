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

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
        <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
      </div>

      {onQuickAction && (
        <button
          className="ml-3 w-10 h-10 flex items-center justify-center bg-amber-500 text-white rounded-full hover:bg-amber-600 active:bg-amber-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction();
          }}
        >
          <span className="text-lg">✓</span>
        </button>
      )}
    </div>
  );
}
