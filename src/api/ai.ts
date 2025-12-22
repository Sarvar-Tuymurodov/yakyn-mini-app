import { api } from "./client";
import type { Frequency } from "../types";

interface SuggestionsResponse {
  suggestions: string[];
}

interface TranscribeResponse {
  text: string;
}

interface VoiceToContactResponse {
  contact: {
    name: string;
    frequency?: Frequency;
    notes?: string;
    birthday?: string;
  };
  transcribedText: string;
}

export const aiApi = {
  getSuggestions: (contactId: number) =>
    api.post<SuggestionsResponse>("/api/ai/suggestions", { contactId }),

  transcribeAudio: (audioBase64: string) =>
    api.post<TranscribeResponse>("/api/ai/transcribe", { audio: audioBase64 }),

  voiceToContact: (audioBase64: string) =>
    api.post<VoiceToContactResponse>("/api/ai/voice-to-contact", { audio: audioBase64 }),
};
