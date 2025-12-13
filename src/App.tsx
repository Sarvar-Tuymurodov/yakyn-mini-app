import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { AddContactPage } from "./pages/AddContactPage";
import { SettingsPage } from "./pages/SettingsPage";
import { setInitData } from "./api/client";

const LOADING_MESSAGES = [
  "Connecting hearts...",
  "Loading your circle...",
  "Warming up relationships...",
  "Bringing people closer...",
];

function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Rotate messages every 2 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Yakyn</h1>

      {/* Loading spinner */}
      <div className="mb-6">
        <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>

      {/* Loading message */}
      <p className="text-amber-600 font-medium min-w-48 text-center">
        {LOADING_MESSAGES[messageIndex]}{dots}
      </p>
    </div>
  );
}

function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Try to get initData from Telegram WebApp
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram;

    if (tg?.WebApp?.initData) {
      setInitData(tg.WebApp.initData);
      tg.WebApp.ready?.();
    }

    // For development, use stored telegram id
    if (import.meta.env.DEV) {
      const storedId = localStorage.getItem("dev_telegram_id");
      if (!storedId) {
        // Set a default for development
        localStorage.setItem("dev_telegram_id", "641241983");
      }
    }

    setReady(true);
  }, []);

  if (!ready) {
    return <LoadingScreen />;
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
