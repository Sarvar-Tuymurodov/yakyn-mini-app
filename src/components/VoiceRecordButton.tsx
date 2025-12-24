import { useRef, useCallback } from "react";

type VoiceState = "idle" | "recording" | "transcribing";

interface VoiceRecordButtonProps {
  state: VoiceState;
  size?: "sm" | "md" | "lg";
  audioLevel?: number; // 0-100, for recording visualization
  hasPermission?: boolean;
  onRequestPermission?: () => Promise<boolean>;
  onRecordStart: () => void;
  onRecordEnd: () => void;
  disabled?: boolean;
}

const sizes = {
  sm: { container: "w-10 h-10", icon: "w-5 h-5" },
  md: { container: "w-12 h-12", icon: "w-6 h-6" },
  lg: { container: "w-14 h-14", icon: "w-7 h-7" },
};

export function VoiceRecordButton({
  state,
  size = "md",
  audioLevel = 0,
  hasPermission = true,
  onRequestPermission,
  onRecordStart,
  onRecordEnd,
  disabled = false,
}: VoiceRecordButtonProps) {
  const isHoldingRef = useRef(false);
  const s = sizes[size];

  // Handle start (mousedown/touchstart)
  const handleStart = useCallback(async () => {
    if (disabled || state !== "idle") return;

    // If no permission, request it first (single tap)
    if (!hasPermission && onRequestPermission) {
      await onRequestPermission();
      return; // Don't start recording, just request permission
    }

    isHoldingRef.current = true;
    onRecordStart();
  }, [disabled, state, hasPermission, onRequestPermission, onRecordStart]);

  // Handle end (mouseup/touchend)
  const handleEnd = useCallback(() => {
    if (isHoldingRef.current && state === "recording") {
      isHoldingRef.current = false;
      onRecordEnd();
    }
  }, [state, onRecordEnd]);

  // Pointer events - work for both mouse and touch uniformly
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleStart();
  }, [handleStart]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    handleEnd();
  }, [handleEnd]);

  // Prevent context menu on long press
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Mic icon
  const MicIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  // Spinner icon
  const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  // TRANSCRIBING state - show loader
  if (state === "transcribing") {
    return (
      <div className={`${s.container} rounded-full bg-gray-200 dark:bg-[#404040] flex items-center justify-center`}>
        <SpinnerIcon className={`${s.icon} text-violet-500`} />
      </div>
    );
  }

  // RECORDING state - violet bg, scaled bigger, pulsing rings
  if (state === "recording") {
    // Base size in pixels for calculations
    const baseSize = size === "sm" ? 40 : size === "md" ? 48 : 56;
    // Outer ring - bigger and more reactive
    const outerRing = baseSize * 1.8 + (audioLevel / 100) * baseSize * 0.8;
    // Inner ring
    const innerRing = baseSize * 1.4 + (audioLevel / 100) * baseSize * 0.5;

    return (
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings - bigger */}
        <div
          className="absolute rounded-full bg-violet-500/15 animate-pulse"
          style={{
            width: `${outerRing}px`,
            height: `${outerRing}px`,
            transition: "all 80ms ease-out",
          }}
        />
        <div
          className="absolute rounded-full bg-violet-500/25"
          style={{
            width: `${innerRing}px`,
            height: `${innerRing}px`,
            transition: "all 80ms ease-out",
          }}
        />

        {/* Main button - scaled up more */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={handleContextMenu}
          className={`${s.container} rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/40 touch-none select-none z-10 scale-125 transition-transform`}
        >
          <MicIcon className={`${s.icon} text-white`} />
        </button>
      </div>
    );
  }

  // IDLE state - casual bg, 50% opacity icon
  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
      disabled={disabled}
      className={`${s.container} rounded-full bg-gray-200 dark:bg-[#404040] hover:bg-gray-300 dark:hover:bg-[#505050] flex items-center justify-center transition-all active:scale-95 touch-none select-none disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <MicIcon className={`${s.icon} text-white `} />
    </button>
  );
}
