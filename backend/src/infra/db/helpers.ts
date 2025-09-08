import { PoolClient } from 'pg';
import { getPool } from './pool';
import { logger } from '../../utils/logger';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a SQL query with parameters
 */
export async function query<T = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Database query executed', {
      query: text,
      params,
      duration,
      rowCount: result.rowCount,
    });
    
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database query failed', {
      query: text,
      params,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Execute multiple queries within a transaction
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    client.release();
  }
}
