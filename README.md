# Yakyn - Mini App

Telegram Mini App for staying connected with the people who matter. Yakyn helps you maintain relationships by sending timely reminders to reach out to friends, family, and colleagues.

## Features

### Current Features
- **Contact Management** - Add, edit, and organize your contacts
- **Smart Reminders** - Get notified when it's time to reach out (weekly, biweekly, monthly, quarterly)
- **Voice-to-Contact** - Add contacts by speaking naturally ("Alisher, friend from university, birthday March 15, call monthly")
- **AI Message Suggestions** - Get personalized message ideas based on contact context and notes
- **Birthday Reminders** - Never miss important birthdays
- **Pull-to-Refresh** - Swipe down to refresh your contact list
- **Bilingual Support** - Russian and Uzbek languages
- **Dark Mode** - Automatic theme based on Telegram settings

### Tech Stack
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Telegram Mini App SDK

## Project Structure

```
src/
├── api/           # API clients (contacts, AI, users)
├── assets/        # Static assets (logo, icons)
├── components/    # Reusable UI components
│   ├── ui/        # Base components (Button, Card, Skeleton)
│   ├── AddContactFAB.tsx
│   ├── ContactCard.tsx
│   ├── VoiceRecordButton.tsx
│   └── ...
├── hooks/         # Custom React hooks
│   ├── useContacts.ts
│   ├── useVoiceRecording.ts
│   ├── usePullToRefresh.ts
│   └── ...
├── locales/       # i18n translations (ru.json, uz.json)
├── pages/         # Page components
│   ├── HomePage.tsx
│   ├── ContactPage.tsx
│   ├── AddContactPage.tsx
│   └── SettingsPage.tsx
└── types/         # TypeScript types
```

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
VITE_API_BASE_URL=https://your-bot-api.com
```

## Future Plans

See [Future Features](#future-features) section below.

---

## Future Features

### Priority 1 - Core Improvements
- [ ] **Snooze Improvements** - Custom snooze duration picker
- [ ] **Contact Groups** - Organize contacts into groups (Family, Work, Friends)
- [ ] **Search & Filter** - Advanced search with filters by group, frequency, last contact date
- [ ] **Contact Import** - Import contacts from phone's contact list

### Priority 2 - Engagement Features
- [ ] **Streak System** - Track your consistency in maintaining relationships
- [ ] **Statistics Dashboard** - View your communication patterns and history
- [ ] **Reminder Templates** - Save and reuse message templates
- [ ] **Quick Actions** - One-tap actions (call, message via Telegram/WhatsApp)

### Priority 3 - Advanced Features
- [ ] **Smart Scheduling** - AI suggests optimal times to reach out
- [ ] **Relationship Health Score** - Visual indicator of relationship strength
- [ ] **Event Reminders** - Add custom events (anniversaries, meetings)
- [ ] **Notes Timeline** - See history of notes and interactions
- [ ] **Export Data** - Export contacts and history to CSV/JSON

### Priority 4 - Social Features
- [ ] **Shared Contacts** - Share contact reminders with family members
- [ ] **Mutual Reminders** - Both parties get reminded to connect
