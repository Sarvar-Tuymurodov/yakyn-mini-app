import { useState, useEffect } from "react";
import type { Language } from "../types";

interface UndoToastProps {
  contactName: string;
  language: Language;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

export function UndoToast({
  contactName,
  language,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const texts = {
    ru: {
      marked: "Отмечено: связались с",
      undo: "Отменить",
    },
    uz: {
      marked: "Belgilandi:",
      undo: "Bekor qilish",
    },
  };

  const t = texts[language];

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-amber-500 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-white text-sm">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {t.marked} <span className="font-medium">{contactName}</span>
            </span>
          </div>
          <button
            onClick={onUndo}
            className="px-3 py-1.5 text-amber-400 font-semibold text-sm hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t.undo}
          </button>
        </div>
      </div>
    </div>
  );
}
