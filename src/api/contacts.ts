import { api } from "./client";
import type { Contact, Frequency } from "../types";

interface ContactsResponse {
  contacts: Contact[];
}

interface ContactResponse {
  contact: Contact;
}

interface CreateContactData {
  name: string;
  frequency: Frequency;
  reminderTime: string;
}

interface UpdateContactData {
  name?: string;
  frequency?: Frequency;
  reminderTime?: string;
}

export const contactsApi = {
  getAll: () => api.get<ContactsResponse>("/api/contacts"),

  getById: (id: number) => api.get<ContactResponse>(`/api/contacts/${id}`),

  create: (data: CreateContactData) =>
    api.post<ContactResponse>("/api/contacts", data),

  update: (id: number, data: UpdateContactData) =>
    api.put<ContactResponse>(`/api/contacts/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/api/contacts/${id}`),

  markContacted: (id: number) =>
    api.post<ContactResponse>(`/api/contacts/${id}/contacted`),

  snooze: (id: number) =>
    api.post<ContactResponse>(`/api/contacts/${id}/snooze`),
};
