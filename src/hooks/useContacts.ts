import { useState, useEffect, useCallback } from "react";
import { contactsApi } from "../api/contacts";
import type { Contact, Frequency } from "../types";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsApi.getAll();
      setContacts(response.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (
    name: string,
    frequency: Frequency,
    reminderTime: string
  ) => {
    const response = await contactsApi.create({ name, frequency, reminderTime });
    setContacts((prev) => [...prev, response.contact]);
    return response.contact;
  };

  const updateContact = async (
    id: number,
    data: { name?: string; frequency?: Frequency; reminderTime?: string }
  ) => {
    const response = await contactsApi.update(id, data);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? response.contact : c))
    );
    return response.contact;
  };

  const deleteContact = async (id: number) => {
    await contactsApi.delete(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const markContacted = async (id: number) => {
    const response = await contactsApi.markContacted(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? response.contact : c))
    );
    return response.contact;
  };

  // Group contacts by status
  const overdueContacts = contacts.filter((c) => c.status === "overdue");
  const todayContacts = contacts.filter((c) => c.status === "today");
  const upcomingContacts = contacts.filter((c) => c.status === "upcoming");

  return {
    contacts,
    overdueContacts,
    todayContacts,
    upcomingContacts,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    markContacted,
  };
}
