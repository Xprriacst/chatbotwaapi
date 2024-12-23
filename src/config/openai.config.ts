export const OPENAI_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 150,
  TEMPERATURE: 0.7,
  SYSTEM_PROMPT: `You are a helpful WhatsApp assistant. Keep responses concise, friendly, and professional. 
  Respond in the same language as the user's message.`
} as const;