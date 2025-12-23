import { api } from "./client";

type AnalyticsEvent =
  | "app_opened"
  | "contact_created"
  | "contact_deleted"
  | "contact_contacted"
  | "contact_snoozed"
  | "voice_to_contact_used"
  | "ai_suggestions_requested"
  | "reminder_sent"
  | "reminder_clicked";

export const analyticsApi = {
  track: (event: AnalyticsEvent, metadata?: Record<string, unknown>) =>
    api.post("/api/analytics/track", { event, metadata }).catch(() => {
      // Silently fail - analytics should never break the app
    }),
};
