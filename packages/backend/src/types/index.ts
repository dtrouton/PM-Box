export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
}

export interface SSEEvent {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}

export interface SessionInfo {
  id: string;
  startedAt: number;
  messageCount: number;
}
