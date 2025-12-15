import type { Contact, Language } from "../types";
import { useTranslation } from "../hooks/useTranslation";

interface ContactCardProps {
  contact: Contact;
  language: Language;
  onClick?: () => void;
  onQuickAction?: () => void;
}

// Get initials from name (up to 2 characters)
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Generate consistent color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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

  const getDaysUntilBirthday = (): number | null => {
    if (!contact.birthday) return null;
    const birthday = new Date(contact.birthday);
    const now = new Date();
    const thisYear = now.getFullYear();

    const birthdayThisYear = new Date(thisYear, birthday.getMonth(), birthday.getDate());
    if (birthdayThisYear < now) {
      birthdayThisYear.setFullYear(thisYear + 1);
    }

    const diffTime = birthdayThisYear.getTime() - now.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilBirthday = getDaysUntilBirthday();
  const showQuickAction = onQuickAction && (contact.status === "overdue" || contact.status === "today");

  return (
    <div
      className="flex items-center gap-3 p-3 bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-100 dark:border-[#404040] active:scale-[0.98] transition-all duration-150"
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={`w-11 h-11 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-white font-semibold text-sm shrink-0`}
      >
        {getInitials(contact.name)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {contact.name}
          </h3>
          {daysUntilBirthday !== null && daysUntilBirthday <= 7 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                daysUntilBirthday === 0
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                  : "bg-pink-100 dark:bg-pink-900/30 text-pink-600"
              }`}
            >
              🎂 {daysUntilBirthday === 0 ? "!" : daysUntilBirthday}
            </span>
          )}
        </div>
        <p
          className={`text-sm ${
            contact.status === "overdue"
              ? "text-red-500 dark:text-red-400"
              : contact.status === "today"
              ? "text-amber-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {getStatusText()}
        </p>
      </div>

      {/* Quick Action - only for overdue/today */}
      {showQuickAction && (
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-colors ${
            contact.status === "overdue"
              ? "bg-red-100 dark:bg-red-900/30 text-red-500 active:bg-red-200"
              : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 active:bg-amber-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction();
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {/* Arrow for upcoming contacts */}
      {!showQuickAction && (
        <svg
          className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
}
