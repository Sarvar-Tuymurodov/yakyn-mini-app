import { useState, useRef, useCallback, useEffect } from "react";

type PermissionStatus = "granted" | "denied" | "prompt" | "unknown";

interface UseVoiceRecordingOptions {
  minDuration?: number;
  onTranscribe?: (audioBlob: Blob) => Promise<void>;
}

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useVoiceRecording(
  options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingReturn {
  const { minDuration = 500, onTranscribe } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("unknown");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTime = useRef<number>(0);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Try the Permissions API first
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
          setPermissionStatus(result.state as PermissionStatus);

          // Listen for permission changes
          result.onchange = () => {
            setPermissionStatus(result.state as PermissionStatus);
          };
        } else {
          // Fallback: check localStorage for previous grant
          const previouslyGranted = localStorage.getItem("yakyn_mic_permission") === "granted";
          setPermissionStatus(previouslyGranted ? "granted" : "prompt");
        }
      } catch {
        // Permissions API not supported, check localStorage
        const previouslyGranted = localStorage.getItem("yakyn_mic_permission") === "granted";
        setPermissionStatus(previouslyGranted ? "granted" : "prompt");
      }
    };

    checkPermission();
  }, []);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Request permission without starting recording
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the stream - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus("granted");
      localStorage.setItem("yakyn_mic_permission", "granted");
      return true;
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionStatus("denied");
      localStorage.setItem("yakyn_mic_permission", "denied");
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingStartTime.current = Date.now();

      // Update permission status
      setPermissionStatus("granted");
      localStorage.setItem("yakyn_mic_permission", "granted");

      // Setup audio analyser for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualization loop
      const updateLevels = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = (dataArray[1] + dataArray[2] + dataArray[3] + dataArray[4] + dataArray[5]) / 5;
        const level = Math.min(100, (avg / 255) * 100 * 1.5);
        setAudioLevel(level);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();

        const recordingDuration = Date.now() - recordingStartTime.current;
        if (recordingDuration < minDuration) {
          // Too short, ignore
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (onTranscribe) {
          setIsProcessing(true);
          try {
            await onTranscribe(audioBlob);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }, [minDuration, onTranscribe]);

  const stopRecording = useCallback(() => {
    cleanup();

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [cleanup, isRecording]);

  return {
    isRecording,
    isProcessing,
    audioLevel,
    permissionStatus,
    requestPermission,
    startRecording,
    stopRecording,
  };
}
