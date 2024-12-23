import { OPENAI_CONFIG } from '../../config/openai.config';

export class OpenAIService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`
  };

  static async generateResponse(message: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: OPENAI_CONFIG.MODEL,
          messages: [
            { role: 'system', content: OPENAI_CONFIG.SYSTEM_PROMPT },
            { role: 'user', content: message }
          ],
          max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          temperature: OPENAI_CONFIG.TEMPERATURE
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }
}