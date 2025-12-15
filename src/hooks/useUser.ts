import { useState, useEffect, useCallback } from "react";
import { userApi } from "../api/user";
import type { User, UserStats, Language } from "../types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.get();
      setUser(response.user);
      setStats(response.stats);

      // Sync localStorage with server language
      if (response.user?.language) {
        localStorage.setItem("yakyn_language", response.user.language);
        localStorage.setItem("yakyn_onboarded", "true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateLanguage = async (language: Language) => {
    const response = await userApi.updateSettings({ language });
    setUser(response.user);
    // Sync to localStorage for immediate persistence
    localStorage.setItem("yakyn_language", language);
    return response.user;
  };

  const updateTimezone = async (timezone: string) => {
    const response = await userApi.updateSettings({ timezone });
    setUser(response.user);
    return response.user;
  };

  return {
    user,
    stats,
    loading,
    error,
    refetch: fetchUser,
    updateLanguage,
    updateTimezone,
  };
}
