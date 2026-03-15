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
