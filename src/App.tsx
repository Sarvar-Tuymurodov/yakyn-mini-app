import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { AddContactPage } from "./pages/AddContactPage";
import { SettingsPage } from "./pages/SettingsPage";
import { setInitData } from "./api/client";

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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-amber-600">Loading...</div>
      </div>
    );
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
