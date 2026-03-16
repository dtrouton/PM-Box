import { Router } from 'express';
import { getCommitLog, getCommitByHash, getCommitAncestor, getCommitDiffSummary, getTableDiff, rewindTo } from '../database/history.js';

const router = Router();

// GET /api/history — list recent Dolt commits
router.get('/history', async (_req, res) => {
  try {
    const limit = parseInt(_req.query.limit as string) || 50;
    const commits = await getCommitLog(limit);
    res.json(commits);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

// GET /api/history/:hash/diff — show what changed in a commit
router.get('/history/:hash/diff', async (req, res) => {
  try {
    const { hash } = req.params;

    const commit = await getCommitByHash(hash);
    if (!commit) {
      res.status(404).json({ error: 'Commit not found' });
      return;
    }

    const parent = await getCommitAncestor(hash);
    if (!parent) {
      res.json({ commit, diff: [], message: 'Initial commit — no parent to diff against' });
      return;
    }

    const summary = await getCommitDiffSummary(parent.commit_hash, hash);

    // Get detailed diffs for each changed table
    const details: Record<string, unknown[]> = {};
    for (const entry of summary) {
      const tableName = entry.table_name;
      try {
        const tableDiff = await getTableDiff(tableName, parent.commit_hash, hash);
        details[tableName] = tableDiff;
      } catch {
        details[tableName] = [];
      }
    }

    res.json({ commit, summary, details });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

// POST /api/history/rewind — rewind database to a specific commit
router.post('/history/rewind', async (req, res) => {
  try {
    const { commitHash, confirm } = req.body;
    if (!commitHash || typeof commitHash !== 'string') {
      res.status(400).json({ error: 'commitHash is required' });
      return;
    }
    if (confirm !== true) {
      res.status(400).json({ error: 'confirm must be true to rewind the database' });
      return;
    }

    await rewindTo(commitHash);
    res.json({ success: true, message: `Database rewound to ${commitHash}` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

export default router;
