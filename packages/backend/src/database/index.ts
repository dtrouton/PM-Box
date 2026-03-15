import { getPool } from './connection.js';
import { initializeSchema } from './schema.js';
import { seedIfEmpty } from './seed.js';

export async function initializeDatabase(): Promise<void> {
  console.log('Connecting to Dolt database...');
  await getPool();
  await initializeSchema();
  await seedIfEmpty();
  console.log('Database ready.');
}

export { getPool, execute, run, closePool } from './connection.js';
export { initializeSchema, tablesExist } from './schema.js';
export { seedIfEmpty } from './seed.js';
export * from './history.js';
