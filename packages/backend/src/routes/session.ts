import { Router } from 'express';
import { resetSession, getSessionInfo } from '../claude/client.js';

const router = Router();

router.get('/session', (_req, res) => {
  res.json(getSessionInfo());
});

router.post('/session/reset', (_req, res) => {
  resetSession();
  res.json({ success: true, message: 'Session reset' });
});

export default router;
