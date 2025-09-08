import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { query } from './helpers';
import { logger } from '../../utils/logger';

interface Migration {
  id: number;
  filename: string;
  sql: string;
}

async function createMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getExecutedMigrations(): Promise<number[]> {
  const result = await query<{ id: number }>('SELECT id FROM migrations ORDER BY id');
  return result.rows.map(row => row.id);
}

function loadMigrations(): Migration[] {
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  return files.map(filename => {
    const match = filename.match(/^(\d+)_/);
    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}. Must start with a number.`);
    }

    const id = parseInt(match[1], 10);
    const sql = readFileSync(join(migrationsDir, filename), 'utf-8');

    return { id, filename, sql };
  });
}

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    // Ensure migrations table exists
    await createMigrationsTable();

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Load all migration files
    const allMigrations = loadMigrations();

    // Find pending migrations
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    // Execute pending migrations
    for (const migration of pendingMigrations) {
      logger.info(`Executing migration: ${migration.filename}`);
      
      await query(migration.sql);
      await query(
        'INSERT INTO migrations (id, filename) VALUES ($1, $2)',
        [migration.id, migration.filename]
      );

      logger.info(`Migration completed: ${migration.filename}`);
    }

    logger.info(`Successfully executed ${pendingMigrations.length} migrations`);
  } catch (error) {
    logger.error('Migration failed', { error });
    throw error;
  }
}
