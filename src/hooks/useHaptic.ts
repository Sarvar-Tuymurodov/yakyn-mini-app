import WebApp from "@twa-dev/sdk";

/**
 * Telegram Mini App Haptic Feedback Hook
 *
 * Types:
 * - impactOccurred: light | medium | heavy | rigid | soft
 * - notificationOccurred: error | success | warning
 * - selectionChanged: for selection changes
 */
export function useHaptic() {
  const isSupported = !!WebApp.HapticFeedback;

  const impact = (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
    if (isSupported) {
      WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const notification = (type: "error" | "success" | "warning") => {
    if (isSupported) {
      WebApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const selection = () => {
    if (isSupported) {
      WebApp.HapticFeedback.selectionChanged();
    }
  };

  return {
    isSupported,
    impact,
    notification,
    selection,
    // Convenience shortcuts
    success: () => notification("success"),
    error: () => notification("error"),
    warning: () => notification("warning"),
    tap: () => impact("light"),
    button: () => impact("medium"),
    heavy: () => impact("heavy"),
  };
}
