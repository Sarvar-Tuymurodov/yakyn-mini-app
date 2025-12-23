import { useState, useEffect, useCallback } from "react";

interface UseMicPermissionReturn {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useMicPermission(): UseMicPermissionReturn {
  const [hasPermission, setHasPermission] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
          setHasPermission(result.state === "granted");
          result.onchange = () => setHasPermission(result.state === "granted");
        } else {
          // Fallback: check localStorage
          setHasPermission(localStorage.getItem("yakyn_mic_permission") === "granted");
        }
      } catch {
        setHasPermission(localStorage.getItem("yakyn_mic_permission") === "granted");
      }
    };
    checkPermission();
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      localStorage.setItem("yakyn_mic_permission", "granted");
      return true;
    } catch (error) {
      console.error("Mic permission denied:", error);
      localStorage.setItem("yakyn_mic_permission", "denied");
      return false;
    }
  }, []);

  return { hasPermission, requestPermission };
}
