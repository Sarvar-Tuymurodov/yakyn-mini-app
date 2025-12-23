import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { AddContactPage } from "./pages/AddContactPage";
import { SettingsPage } from "./pages/SettingsPage";
import { setInitData } from "./api/client";
import { userApi } from "./api/user";
import { analyticsApi } from "./api/analytics";
import type { Language } from "./types";

function LanguageSelectionScreen({ onSelect }: { onSelect: (lang: Language) => void }) {
  const [fadeIn, setFadeIn] = useState(false);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  const handleSelect = async (lang: Language) => {
    if (selecting) return;
    setSelecting(true);

    try {
      await userApi.updateSettings({ language: lang });
      localStorage.setItem("yakyn_onboarded", "true");
      localStorage.setItem("yakyn_language", lang);
      onSelect(lang);
    } catch (error) {
      console.error("Failed to save language:", error);
      // Still proceed even if API fails
      localStorage.setItem("yakyn_onboarded", "true");
      localStorage.setItem("yakyn_language", lang);
      onSelect(lang);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30 dark:from-[#1f1f1f] dark:via-[#1f1f1f] dark:to-[#1f1f1f] transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-300/40 dark:shadow-amber-900/30">
          <svg className="w-14 h-14" viewBox="-25 -20 150 140" fill="none">
            <circle cx="50" cy="32" r="20" stroke="white" strokeWidth="5" fill="none"/>
            <circle cx="35" cy="58" r="20" stroke="white" strokeWidth="5" fill="none"/>
            <circle cx="65" cy="58" r="20" stroke="white" strokeWidth="5" fill="none"/>
          </svg>
        </div>
      </div>

      {/* App name */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
        Yakyn
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-12">
        Выберите язык / Tilni tanlang
      </p>

      {/* Language buttons */}
      <div className="flex flex-col gap-3 w-64">
        <button
          onClick={() => handleSelect("ru")}
          disabled={selecting}
          className="w-full py-4 px-6 bg-white dark:bg-[#2d2d2d] border-2 border-gray-200 dark:border-[#404040] rounded-2xl text-lg font-medium text-gray-800 dark:text-gray-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-[#3d3d3d] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          🇷🇺 Русский
        </button>
        <button
          onClick={() => handleSelect("uz")}
          disabled={selecting}
          className="w-full py-4 px-6 bg-white dark:bg-[#2d2d2d] border-2 border-gray-200 dark:border-[#404040] rounded-2xl text-lg font-medium text-gray-800 dark:text-gray-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-[#3d3d3d] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          🇺🇿 O'zbekcha
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const [fadeIn, setFadeIn] = useState(false);
  const [scaleIn, setScaleIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    setTimeout(() => setScaleIn(true), 200);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30 dark:from-[#1f1f1f] dark:via-[#1f1f1f] dark:to-[#1f1f1f] transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      {/* Large Logo with heartbeat animation */}
      <div className={`mb-6 transition-transform duration-700 ${scaleIn ? "scale-100" : "scale-75"}`}>
        <div className="w-36 h-36 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-300/50 dark:shadow-amber-900/30 animate-[pulse_2s_ease-in-out_infinite]">
          <svg className="w-20 h-20 drop-shadow-lg" viewBox="-25 -20 150 140" fill="none">
            <circle cx="50" cy="32" r="20" stroke="white" strokeWidth="5" fill="none"/>
            <circle cx="35" cy="58" r="20" stroke="white" strokeWidth="5" fill="none"/>
            <circle cx="65" cy="58" r="20" stroke="white" strokeWidth="5" fill="none"/>
          </svg>
        </div>
      </div>

      {/* App Name - bigger and bolder */}
      <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-3">
        Yakyn
      </h1>

      {/* Emotional tagline */}
      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
        Yaqinlaringizni unutmang
      </p>
    </div>
  );
}

function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Apply theme based on Telegram colorScheme
    const applyTheme = () => {
      const isDark = WebApp.colorScheme === "dark";
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Check if we are inside Telegram WebApp
    const isTelegram = Boolean(WebApp.initDataUnsafe?.user);
    const telegramUser = WebApp.initDataUnsafe?.user;

    if (isTelegram && telegramUser) {
      // Set initData for API calls
      if (WebApp.initData) {
        setInitData(WebApp.initData);
      }

      // Configure Telegram Mini App
      WebApp.ready();
      WebApp.expand(); // Expand to full height
      WebApp.disableVerticalSwipes(); // Disable swipe-to-close
      WebApp.enableClosingConfirmation(); // Ask before closing

      // Apply theme and set colors based on theme
      applyTheme();
      const isDark = WebApp.colorScheme === "dark";
      WebApp.setHeaderColor(isDark ? "#1f1f1f" : "#f59e0b");
      WebApp.setBackgroundColor(isDark ? "#1f1f1f" : "#fafafa");

      // Listen for theme changes
      WebApp.onEvent("themeChanged", applyTheme);

      // Try to go fullscreen
      try {
        WebApp.requestFullscreen();
      } catch {
        // Fullscreen not supported on this platform
      }


      // Also store the real user ID for debugging
      localStorage.setItem("dev_telegram_id", String(telegramUser.id));
    } else {
      // Development mode - running outside Telegram
      const isDev = import.meta.env.DEV || window.location.hostname === "localhost";

      if (isDev) {
        // Set a default dev telegram ID if not already set
        if (!localStorage.getItem("dev_telegram_id")) {
          localStorage.setItem("dev_telegram_id", "123456789");
          console.log("🔧 Dev mode: Set default telegram ID 123456789");
        }
      }

      // Check system preference for dark mode in dev
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }

    // Check if user needs onboarding (first time)
    const isOnboarded = localStorage.getItem("yakyn_onboarded") === "true";

    // Loading delay
    const minLoadTime = 1200;
    const startTime = Date.now();

    const completeLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);
      setTimeout(() => {
        setNeedsOnboarding(!isOnboarded);
        setReady(true);
        // Track app opened
        analyticsApi.track("app_opened");
      }, remaining);
    };

    completeLoading();

    return () => {
      WebApp.offEvent("themeChanged", applyTheme);
    };
  }, []);

  const handleLanguageSelected = () => {
    setNeedsOnboarding(false);
  };

  if (!ready) {
    return <LoadingScreen />;
  }

  if (needsOnboarding) {
    return <LanguageSelectionScreen onSelect={handleLanguageSelected} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <TelegramProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact/:id" element={<ContactPage />} />
          <Route path="/add" element={<AddContactPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </TelegramProvider>
  );
}

export default App;
