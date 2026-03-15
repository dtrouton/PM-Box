import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import { PM_SYSTEM_PROMPT } from './system-prompt.js';

// Since this is single-user, we use the SDK's session resume capability
let currentSessionId: string | undefined;
let sessionStartedAt: number = Date.now();
let messageCount = 0;

export async function* streamChat(userMessage: string): AsyncGenerator<string> {
  messageCount++;

  const result = query({
    prompt: userMessage,
    options: {
      cwd: process.cwd(),
      systemPrompt: PM_SYSTEM_PROMPT,
      includePartialMessages: true,
      permissionMode: 'acceptEdits',
      settingSources: ['project'],
      ...(currentSessionId ? { continue: true } : {}),
    },
  });

  let fullResponse = '';

  for await (const event of result) {
    // Capture session ID from system init
    if (event.type === 'system' && 'subtype' in event && event.subtype === 'init') {
      currentSessionId = event.session_id;
    }

    // Stream partial text tokens to the client
    if (event.type === 'stream_event' && event.event.type === 'content_block_delta') {
      const delta = event.event.delta;
      if ('text' in delta) {
        fullResponse += delta.text;
        yield delta.text;
      }
    }

    // If we get a final result, yield any remaining text
    if (event.type === 'result' && event.subtype === 'success') {
      if (!fullResponse && event.result) {
        yield event.result;
      }
    }
  }

  messageCount++;
}

export function resetSession() {
  currentSessionId = undefined;
  sessionStartedAt = Date.now();
  messageCount = 0;
}

export function getSessionInfo() {
  return {
    messageCount,
    startedAt: sessionStartedAt,
    sessionId: currentSessionId,
  };
}
