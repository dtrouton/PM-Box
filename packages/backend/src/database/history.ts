import { execute, run } from './connection.js';

export interface DoltCommit {
  commit_hash: string;
  committer: string;
  email: string;
  date: string;
  message: string;
}

export interface DoltDiff {
  table_name: string;
  diff_type: string;
  data_change: number;
  schema_change: number;
}

export interface DoltTableDiff {
  [key: string]: unknown;
}

export async function getCommitLog(limit = 50): Promise<DoltCommit[]> {
  const rows = await execute(
    'SELECT commit_hash, committer, email, date, message FROM dolt_log ORDER BY date DESC LIMIT ?',
    [limit],
  );
  return rows as unknown as DoltCommit[];
}

export async function getCommitAncestor(commitHash: string): Promise<DoltCommit | null> {
  // dolt_commit_ancestors returns (commit_hash, parent_hash, parent_index)
  const ancestors = await execute(
    'SELECT parent_hash FROM dolt_commit_ancestors WHERE commit_hash = ? AND parent_index = 0',
    [commitHash],
  );
  if (ancestors.length === 0) return null;
  const parentHash = (ancestors[0] as unknown as { parent_hash: string }).parent_hash;
  return getCommitByHash(parentHash);
}

export async function getCommitByHash(commitHash: string): Promise<DoltCommit | null> {
  const rows = await execute(
    'SELECT commit_hash, committer, email, date, message FROM dolt_log WHERE commit_hash = ?',
    [commitHash],
  );
  return rows.length > 0 ? (rows[0] as unknown as DoltCommit) : null;
}

export async function getCommitDiffSummary(
  fromHash: string,
  toHash: string,
): Promise<DoltDiff[]> {
  const rows = await execute(
    'SELECT * FROM dolt_diff_summary(?, ?)',
    [fromHash, toHash],
  );
  return rows as unknown as DoltDiff[];
}

export async function getTableDiff(
  tableName: string,
  fromHash: string,
  toHash: string,
): Promise<DoltTableDiff[]> {
  const rows = await execute(
    `SELECT * FROM dolt_diff(?, ?, ?)`,
    [fromHash, toHash, tableName],
  );
  return rows as unknown as DoltTableDiff[];
}

export async function rewindTo(commitHash: string): Promise<void> {
  await run('CALL DOLT_RESET(?)', [commitHash]);
  await run('CALL DOLT_CLEAN()');
}

export async function revertCommit(commitHash: string): Promise<void> {
  await run('CALL DOLT_REVERT(?)', [commitHash]);
}

export async function createManualCommit(message: string): Promise<string> {
  await run('CALL DOLT_ADD("-A")');
  const rows = await execute('CALL DOLT_COMMIT("-m", ?)', [message]);
  const result = rows as unknown as Array<{ hash: string }>;
  return result[0]?.hash ?? '';
}
