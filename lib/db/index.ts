import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

type DbType = ReturnType<typeof createDb>;

let _db: DbType | null = null;

export function getDb(): DbType {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Lazy proxy  - db is only initialized on first property access (at request time, not build time)
export const db: DbType = new Proxy({} as DbType, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
