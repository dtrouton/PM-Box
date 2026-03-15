import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import sessionRouter from './routes/session.js';
import historyRouter from './routes/history.js';
import { initializeDatabase } from './database/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', chatRouter);
app.use('/api', sessionRouter);
app.use('/api', historyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pm-box-backend' });
});

async function start() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.warn('Backend starting without database — Dolt may not be running.');
    console.warn('Run: scripts/start-dolt.sh to start the Dolt SQL server.');
  }

  app.listen(PORT, () => {
    console.log(`PM-Box backend running on http://localhost:${PORT}`);
  });
}

start();
