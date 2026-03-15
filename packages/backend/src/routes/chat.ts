import { Router } from 'express';
import { streamChat } from '../claude/client.js';

const router = Router();

// POST /api/chat - streams response via SSE
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    for await (const token of streamChat(message)) {
      res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
