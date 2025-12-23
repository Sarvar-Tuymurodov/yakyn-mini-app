import { useRef, useEffect } from "react";

type VoiceState = "idle" | "recording" | "transcribing";

interface VoiceRecordButtonProps {
  state: VoiceState;
  size?: "sm" | "md" | "lg";
  audioLevel?: number; // 0-100, for recording visualization
  hasPermission?: boolean; // If false, first tap requests permission
  onRequestPermission?: () => void; // Called on first tap when no permission
  onRecordStart: () => void;
  onRecordEnd: () => void;
  disabled?: boolean;
}

const sizes = {
  sm: { container: "w-10 h-10", wrapper: "w-14 h-14", icon: "w-5 h-5", base: 40 },
  md: { container: "w-12 h-12", wrapper: "w-16 h-16", icon: "w-6 h-6", base: 48 },
  lg: { container: "w-14 h-14", wrapper: "w-20 h-20", icon: "w-7 h-7", base: 56 },
};

export function VoiceRecordButton({
  state,
  size = "md",
  audioLevel = 0,
  hasPermission = true, // Default true for backwards compatibility
  onRequestPermission,
  onRecordStart,
  onRecordEnd,
  disabled = false,
}: VoiceRecordButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const s = sizes[size];

  // Check if we need permission first
  const needsPermission = !hasPermission && onRequestPermission;

  // Attach non-passive touch event listeners
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (state === "idle" && !disabled) {
        if (needsPermission) {
          // First tap - request permission (single tap, not hold)
          onRequestPermission?.();
        } else {
          onRecordStart();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (state === "recording") {
        onRecordEnd();
      }
    };

    button.addEventListener("touchstart", handleTouchStart, { passive: false });
    button.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      button.removeEventListener("touchstart", handleTouchStart);
      button.removeEventListener("touchend", handleTouchEnd);
    };
  }, [state, disabled, needsPermission, onRequestPermission, onRecordStart, onRecordEnd]);

  const handleMouseDown = () => {
    if (state === "idle" && !disabled) {
      if (needsPermission) {
        // First click - request permission
        onRequestPermission?.();
      } else {
        onRecordStart();
      }
    }
  };

  const handleMouseUp = () => {
    if (state === "recording") {
      onRecordEnd();
    }
  };

  // Mic icon component
  const MicIcon = () => (
    <svg className={`${s.icon} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  // Recording state - mic with audio-reactive rings
  if (state === "recording") {
    return (
      <div className={`${s.wrapper} relative flex items-center justify-center`}>
        {/* Audio-reactive rings */}
        <div
          className="absolute rounded-full bg-violet-500/15"
          style={{
            width: `${s.base + audioLevel * 0.4}px`,
            height: `${s.base + audioLevel * 0.4}px`,
            transition: "all 50ms ease-out",
          }}
        />
        <div
          className="absolute rounded-full bg-violet-500/25"
          style={{
            width: `${s.base - 4 + audioLevel * 0.25}px`,
            height: `${s.base - 4 + audioLevel * 0.25}px`,
            transition: "all 50ms ease-out",
          }}
        />
        {/* Button */}
        <button
          ref={buttonRef}
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`${s.container} rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 touch-none select-none z-10`}
        >
          <MicIcon />
        </button>
      </div>
    );
  }

  // Idle and Transcribing states
  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled || state === "transcribing"}
      className={`${s.container} rounded-full bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all active:scale-95 touch-none select-none disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {state === "transcribing" ? (
        /* Transcribing - Spinner loader */
        <svg className={`${s.icon} text-white animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        /* Idle - Mic icon */
        <MicIcon />
      )}
    </button>
  );
}
