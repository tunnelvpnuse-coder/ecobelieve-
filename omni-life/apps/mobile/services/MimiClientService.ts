import type { MimiContext, MimiResponse } from '@omni-life/ui/mimi.types';

/**
 * Mobile client for MIMI API endpoints.
 */
export class MimiClientService {
  constructor(private readonly baseUrl: string) {}

  /**
   * Sends a prompt and runtime context to MIMI.
   */
  async askMimi(prompt: string, context: MimiContext): Promise<MimiResponse> {
    const response = await fetch(`${this.baseUrl}/mimi/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      throw new Error(`MIMI request failed with status ${response.status}`);
    }

    return (await response.json()) as MimiResponse;
  }
}
