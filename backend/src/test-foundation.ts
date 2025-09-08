#!/usr/bin/env tsx
/**
 * Foundation test script - verifies environment and database connectivity
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { loadEnv } from './utils/env';
import { logger } from './utils/logger';
import { createPool, closePool } from './infra/db/pool';
import { query } from './infra/db/helpers';
import { runMigrations } from './infra/db/migrate';

async function testFoundation() {
  try {
    logger.info('🧪 Testing Doctors Booking System Foundation');

    // Test 1: Environment configuration
    logger.info('📋 Step 1: Testing environment configuration...');
    const env = loadEnv();
    logger.info('✅ Environment variables loaded successfully', {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
      frontendUrl: env.FRONTEND_URL,
    });

    // Test 2: Database connection
    logger.info('🗄️  Step 2: Testing database connection...');
    const pool = createPool(env.DATABASE_URL);
    
    // Simple connectivity test
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    logger.info('✅ Database connection successful', {
      currentTime: result.rows[0]?.current_time,
      postgresVersion: result.rows[0]?.pg_version?.split(' ')[0] + ' ' + result.rows[0]?.pg_version?.split(' ')[1],
    });

    // Test 3: Run migrations
    logger.info('🔄 Step 3: Running database migrations...');
    await runMigrations();
    logger.info('✅ Database migrations completed');

    // Test 4: Verify tables exist
    logger.info('📊 Step 4: Verifying database schema...');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    logger.info('✅ Database tables verified', { tables });

    // Test 5: Test password utilities
    logger.info('🔐 Step 5: Testing password utilities...');
    const { hashPassword, verifyPassword, validatePassword } = await import('./utils/password');
    
    const testPassword = 'TestPassword123';
    const validation = validatePassword(testPassword);
    if (!validation.valid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }
    
    const hash = await hashPassword(testPassword);
    const isValid = await verifyPassword(testPassword, hash);
    if (!isValid) {
      throw new Error('Password hashing/verification failed');
    }
    logger.info('✅ Password utilities working correctly');

    logger.info('🎉 Foundation test completed successfully!');
    logger.info('💡 Ready to implement authentication endpoints');

  } catch (error) {
    logger.error('❌ Foundation test failed', { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined 
    });
    console.error('Full error details:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFoundation().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
