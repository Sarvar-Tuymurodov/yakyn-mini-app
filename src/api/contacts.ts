import { api } from "./client";
import type { Contact, Frequency, ContactHistoryEntry } from "../types";

interface ContactsResponse {
  contacts: Contact[];
}

interface ContactResponse {
  contact: Contact;
}

interface HistoryResponse {
  history: ContactHistoryEntry[];
}

interface CreateContactData {
  name: string;
  frequency: Frequency;
  reminderTime: string;
  notes?: string;
  birthday?: string;
}

interface ImportContactData {
  name: string;
  notes?: string;
}

interface ImportResponse {
  imported: number;
  contacts: Contact[];
}

interface UpdateContactData {
  name?: string;
  frequency?: Frequency;
  reminderTime?: string;
  notes?: string | null;
  birthday?: string | null;
}

export const contactsApi = {
  getAll: () => api.get<ContactsResponse>("/api/contacts"),

  getById: (id: number) => api.get<ContactResponse>(`/api/contacts/${id}`),

  create: (data: CreateContactData) =>
    api.post<ContactResponse>("/api/contacts", data),

  update: (id: number, data: UpdateContactData) =>
    api.put<ContactResponse>(`/api/contacts/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/api/contacts/${id}`),

  markContacted: (id: number, note?: string) =>
    api.post<ContactResponse>(`/api/contacts/${id}/contacted`, { note }),

  snooze: (id: number, hours: number | "tomorrow") =>
    api.post<ContactResponse>(`/api/contacts/${id}/snooze`, { hours }),

  getHistory: (id: number) =>
    api.get<HistoryResponse>(`/api/contacts/${id}/history`),

  importContacts: (contacts: ImportContactData[]) =>
    api.post<ImportResponse>("/api/contacts/import", { contacts }),
};
