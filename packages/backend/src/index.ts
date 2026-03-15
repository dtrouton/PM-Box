import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import sessionRouter from './routes/session.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', chatRouter);
app.use('/api', sessionRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pm-box-backend' });
});

app.listen(PORT, () => {
  console.log(`PM-Box backend running on http://localhost:${PORT}`);
});
