import { api } from "./client";
import type { User, UserStats, Language } from "../types";

interface UserResponse {
  user: User;
  stats: UserStats;
}

interface UpdateSettingsData {
  language?: Language;
  timezone?: string;
}

export const userApi = {
  get: () => api.get<UserResponse>("/api/user"),

  updateSettings: (data: UpdateSettingsData) =>
    api.put<{ user: User }>("/api/user/settings", data),
};
