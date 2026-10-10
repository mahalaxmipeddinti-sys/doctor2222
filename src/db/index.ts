// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Check for either direct Supabase / PostgreSQL URI (DATABASE_URL) or individual connection parameters
export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME)
);

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    if (isDatabaseConfigured) {
      const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

      if (connectionString) {
        // Direct Supabase / PostgreSQL connection URI
        global._postgresPool = new Pool({
          connectionString,
          ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
            ? false
            : { rejectUnauthorized: false }, // Required for Supabase & Cloud SSL
          max: 10,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        });
      } else {
        // Parameterized connection (Supabase / Cloud SQL host, port, user, etc.)
        const isCloud = process.env.SQL_HOST && !['localhost', '127.0.0.1'].includes(process.env.SQL_HOST);
        global._postgresPool = new Pool({
          host: process.env.SQL_HOST,
          port: Number(process.env.SQL_PORT) || 5432,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          ssl: isCloud ? { rejectUnauthorized: false } : false,
          max: 10,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        });
      }

      // Prevent unhandled pool-level errors from crashing the application
      global._postgresPool.on('error', (err) => {
        console.warn('PostgreSQL / Supabase client warning:', err?.message || err);
      });
    } else {
      // Lazy placeholder pool when database is not provisioned yet (safe in-memory mode)
      global._postgresPool = new Pool({
        host: '127.0.0.1',
        connectionTimeoutMillis: 1000,
      });
      global._postgresPool.on('error', () => {
        // Suppress idle errors when database is unconfigured
      });
    }
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
