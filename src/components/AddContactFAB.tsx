import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { aiApi } from "../api/ai";
import { useHaptic } from "../hooks/useHaptic";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { VoiceRecordButton } from "./VoiceRecordButton";
import type { Language } from "../types";

interface AddContactFABProps {
  language: Language;
}

export function AddContactFAB({ language }: AddContactFABProps) {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [isOpen, setIsOpen] = useState(false);

  const handleTranscribe = useCallback(async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const response = await aiApi.voiceToContact(base64);
        if (response.contact) {
          haptic.success();
          const params = new URLSearchParams();
          params.set("name", response.contact.name);
          if (response.contact.frequency) params.set("frequency", response.contact.frequency);
          if (response.contact.notes) params.set("notes", response.contact.notes);
          if (response.contact.birthday) params.set("birthday", response.contact.birthday);
          navigate(`/add?${params.toString()}`);
        }
      } catch (error) {
        console.error("Failed to process voice:", error);
        haptic.error();
      }
      setIsOpen(false);
    };
  }, [navigate, haptic]);

  const { isRecording, isProcessing, audioLevel, hasPermission, requestPermission, startRecording, stopRecording } = useVoiceRecording({
    onTranscribe: handleTranscribe,
  });

  const handleFABClick = () => {
    haptic.tap();
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      setIsOpen(!isOpen);
    }
  };

  const handleAddByInput = () => {
    haptic.tap();
    setIsOpen(false);
    navigate("/add");
  };

  const handleEnableVoice = async () => {
    haptic.tap();
    const granted = await requestPermission();
    if (granted) {
      haptic.success();
    } else {
      haptic.error();
    }
  };

  const handleRecordStart = () => {
    haptic.tap();
    startRecording().catch(() => haptic.error());
  };

  const handleRecordEnd = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const voiceState = isRecording ? "recording" : isProcessing ? "transcribing" : "idle";
  const isRussian = language === "ru";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => !isRecording && !isProcessing && setIsOpen(false)}
        />
      )}

      {/* FAB Container - fixed position at bottom right */}
      <div className="fixed bottom-6 right-6 z-50 tg-margin-bottom">
        {/* Options menu - positioned absolutely above FAB */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end animate-slide-up">
            {/* Hint tooltip with pointer */}
            {hasPermission && (
              <div className="relative min-w-[180px] max-w-64 bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xs px-4 py-3 rounded-2xl text-right shadow-xl border border-white/10">
                <p className="text-violet-300 font-medium mb-1">
                  {isRussian ? "Зажмите и скажите:" : "Bosib turing va ayting:"}
                </p>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  {isRussian
                    ? "«Алишер, друг из универа, день рождения 15 марта, созваниваемся раз в месяц»"
                    : "«Alisher, universitetdan do'stim, tug'ilgan kuni 15 mart, oyda bir gaplashamiz»"}
                </p>
                {/* Arrow pointer */}
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-white/10" />
              </div>
            )}

            {/* Voice Button - permission aware */}
            {hasPermission ? (
              <div className="flex items-center gap-3 bg-white dark:bg-[#2d2d2d] rounded-full pl-5 pr-3 py-2 shadow-xl border border-gray-100 dark:border-gray-700">
                <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {isRecording
                    ? (isRussian ? "Говорите..." : "Gapiring...")
                    : isProcessing
                    ? (isRussian ? "Обработка..." : "Qayta ishlanmoqda...")
                    : (isRussian ? "Зажмите" : "Bosib turing")}
                </span>
                <VoiceRecordButton
                  state={voiceState}
                  size="md"
                  audioLevel={audioLevel}
                  hasPermission={hasPermission}
                  onRequestPermission={handleEnableVoice}
                  onRecordStart={handleRecordStart}
                  onRecordEnd={handleRecordEnd}
                />
              </div>
            ) : (
              /* Enable Voice button - shown when permission not granted */
              <button
                className="flex items-center gap-3 bg-white dark:bg-[#2d2d2d] rounded-full pl-5 pr-3 py-2 shadow-xl border border-gray-100 dark:border-gray-700"
                onClick={handleEnableVoice}
              >
                <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {isRussian ? "Включить голос" : "Ovozni yoqish"}
                </span>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 active:scale-95 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </button>
            )}

            {/* Manual Input Button */}
            <button
              className="flex items-center gap-3 bg-white dark:bg-[#2d2d2d] rounded-full pl-5 pr-3 py-2 shadow-xl border border-gray-100 dark:border-gray-700"
              onClick={handleAddByInput}
            >
              <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                {isRussian ? "Вручную" : "Qo'lda"}
              </span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Main FAB - always stays in place */}
        <button
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all text-white ${
            isOpen
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-amber-500 hover:bg-amber-600 active:scale-95"
          }`}
          onClick={handleFABClick}
        >
          <svg
            className={`w-7 h-7 transition-transform ${isOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </>
  );
}
