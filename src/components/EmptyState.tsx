import type { Language } from "../types";

interface EmptyStateProps {
  language: Language;
}

// Simple users icon
const UsersIcon = () => (
  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export function EmptyContactsState({ language }: EmptyStateProps) {
  const texts = {
    ru: {
      title: "Пока никого нет",
      subtitle: "Добавьте людей, с которыми хотите поддерживать связь",
    },
    uz: {
      title: "Hozircha hech kim yo'q",
      subtitle: "Aloqada bo'lmoqchi bo'lgan odamlarni qo'shing",
    },
  };

  const { title, subtitle } = texts[language];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <UsersIcon />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-sm">
        {subtitle}
      </p>
    </div>
  );
}
