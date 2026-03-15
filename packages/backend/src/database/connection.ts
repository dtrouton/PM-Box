import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export interface DoltConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const DEFAULT_CONFIG: DoltConfig = {
  host: process.env.DOLT_HOST || 'localhost',
  port: parseInt(process.env.DOLT_PORT || '3306', 10),
  user: process.env.DOLT_USER || 'root',
  password: process.env.DOLT_PASSWORD || '',
  database: process.env.DOLT_DATABASE || 'pmbox',
};

export async function getPool(): Promise<mysql.Pool> {
  if (pool) return pool;

  pool = mysql.createPool({
    ...DEFAULT_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Enable auto-commit on each new connection so every transaction creates a Dolt commit
  pool.on('connection', (connection) => {
    connection.query('SET @@dolt_transaction_commit = 1').catch(() => {
      // Silently ignore if not a Dolt server (for testing with regular MySQL)
    });
  });

  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlParams = any[];

export async function execute<T extends mysql.RowDataPacket[] = mysql.RowDataPacket[]>(
  sql: string,
  params?: SqlParams,
): Promise<T> {
  const p = await getPool();
  const [rows] = await p.execute<T>(sql, params);
  return rows;
}

export async function run(
  sql: string,
  params?: SqlParams,
): Promise<mysql.ResultSetHeader> {
  const p = await getPool();
  const [result] = await p.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
