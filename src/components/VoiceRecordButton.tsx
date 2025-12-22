import { useCallback } from "react";
import { aiApi } from "../api/ai";
import { useHaptic } from "../hooks/useHaptic";
import { useVoiceRecording } from "../hooks/useVoiceRecording";

interface VoiceRecordButtonProps {
  onTranscribed: (text: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function VoiceRecordButton({ onTranscribed, disabled, size = "md" }: VoiceRecordButtonProps) {
  const haptic = useHaptic();

  const handleTranscribe = useCallback(async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const response = await aiApi.transcribeAudio(base64);
        if (response.text) {
          onTranscribed(response.text);
        }
      } catch (error) {
        console.error("Failed to transcribe:", error);
      }
    };
  }, [onTranscribed]);

  const { isRecording, isProcessing, audioLevel, startRecording, stopRecording } = useVoiceRecording({
    onTranscribe: handleTranscribe,
  });

  const handleStart = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isRecording && !isProcessing && !disabled) {
      haptic.tap();
      try {
        await startRecording();
      } catch {
        haptic.error();
      }
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      haptic.tap();
      stopRecording();
    }
  };

  const buttonSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const ringBase = size === "sm" ? 28 : 32;

  return (
    <button
      type="button"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      disabled={disabled || isProcessing}
      className="transition-all touch-none select-none"
    >
      {isRecording ? (
        /* Recording state - Pulsing mic with audio rings */
        <div className="relative flex items-center justify-center w-12 h-12">
          {/* Live audio rings */}
          <div
            className="absolute rounded-full bg-red-500/10"
            style={{
              width: `${ringBase + audioLevel * 0.35}px`,
              height: `${ringBase + audioLevel * 0.35}px`,
              transition: "all 30ms linear",
            }}
          />
          <div
            className="absolute rounded-full bg-red-500/25"
            style={{
              width: `${ringBase + audioLevel * 0.2}px`,
              height: `${ringBase + audioLevel * 0.2}px`,
              transition: "all 30ms linear",
            }}
          />
          {/* Recording indicator */}
          <div className={`relative ${buttonSize} rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse`}>
            <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
        </div>
      ) : isProcessing ? (
        /* Transcribing state - Animated waves */
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className={`${buttonSize} rounded-full bg-violet-500 flex items-center justify-center`}>
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.75 bg-white rounded-full animate-sound-wave-1" />
              <div className="w-0.75 bg-white rounded-full animate-sound-wave-2" />
              <div className="w-0.75 bg-white rounded-full animate-sound-wave-3" />
            </div>
          </div>
        </div>
      ) : (
        /* Default state - Mic button */
        <div className={`${buttonSize} rounded-full bg-violet-500 hover:bg-violet-600 active:scale-110 flex items-center justify-center shadow-md transition-all ${disabled ? "opacity-50" : ""}`}>
          <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      )}
    </button>
  );
}
