export type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly";
export type ContactStatus = "overdue" | "today" | "upcoming";
export type Language = "ru" | "uz";

export interface Contact {
  id: number;
  name: string;
  frequency: Frequency;
  reminderTime: string;
  lastContactAt: string | null;
  nextReminderAt: string;
  status: ContactStatus;
  daysUntil: number;
}

export interface User {
  id: number;
  telegramId: string;
  language: Language;
  timezone: string;
}

export interface UserStats {
  totalContacts: number;
  overdueContacts: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
