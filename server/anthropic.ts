import Anthropic from '@anthropic-ai/sdk';
import type { ModelClient } from './app.ts';

/** The real provider: Anthropic's official SDK. The key is read from the environment, here, on the server. */
export function anthropicClient(apiKey: string): ModelClient {
  const client = new Anthropic({ apiKey });
  return {
    async complete({ model, system, user, maxTokens }) {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        // Short teaching answers: low effort keeps them fast and cheap.
        output_config: { effort: 'low' },
        messages: [{ role: 'user', content: user }],
      });
      const text = response.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('\n')
        .trim();
      return {
        text: text || (response.stop_reason === 'refusal' ? 'The model declined to answer this request.' : '(empty response)'),
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        stopReason: response.stop_reason,
      };
    },
  };
}
