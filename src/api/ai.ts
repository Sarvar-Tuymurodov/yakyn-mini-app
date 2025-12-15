import { api } from "./client";

interface SuggestionsResponse {
  suggestions: string[];
}

interface TranscribeResponse {
  text: string;
}

export const aiApi = {
  getSuggestions: (contactId: number) =>
    api.post<SuggestionsResponse>("/api/ai/suggestions", { contactId }),

  transcribeAudio: (audioBase64: string) =>
    api.post<TranscribeResponse>("/api/ai/transcribe", { audio: audioBase64 }),
};
