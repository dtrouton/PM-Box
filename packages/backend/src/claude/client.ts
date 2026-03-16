import { query } from '@anthropic-ai/claude-agent-sdk';
import { PM_SYSTEM_PROMPT } from './system-prompt.js';
import { pmboxMcpServer } from './tools.js';

// Since this is single-user, we use the SDK's session resume capability
let currentSessionId: string | undefined;
let sessionStartedAt: number = Date.now();
let messageCount = 0;

export async function* streamChat(userMessage: string): AsyncGenerator<string> {
  const result = query({
    prompt: userMessage,
    options: {
      cwd: process.cwd(),
      systemPrompt: PM_SYSTEM_PROMPT,
      includePartialMessages: true,
      permissionMode: 'acceptEdits',
      mcpServers: {
        'pmbox-database': pmboxMcpServer,
      },
      allowedTools: [
        'mcp__pmbox-database__list_tasks',
        'mcp__pmbox-database__create_task',
        'mcp__pmbox-database__update_task',
        'mcp__pmbox-database__delete_task',
        'mcp__pmbox-database__list_stakeholders',
        'mcp__pmbox-database__create_stakeholder',
        'mcp__pmbox-database__update_stakeholder',
        'mcp__pmbox-database__list_projects',
        'mcp__pmbox-database__create_project',
        'mcp__pmbox-database__update_project',
        'mcp__pmbox-database__list_bugs',
        'mcp__pmbox-database__create_bug',
        'mcp__pmbox-database__update_bug',
        'mcp__pmbox-database__list_roadmap_items',
        'mcp__pmbox-database__create_roadmap_item',
        'mcp__pmbox-database__update_roadmap_item',
        'mcp__pmbox-database__list_documents',
        'mcp__pmbox-database__create_document',
        'mcp__pmbox-database__search_all',
        'mcp__pmbox-database__get_history',
        'mcp__pmbox-database__get_history_diff',
        'mcp__pmbox-database__rewind_database',
      ],
      ...(currentSessionId ? { resume: currentSessionId } : {}),
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
