import { neon } from '@neondatabase/serverless';

// Lazily initialized — safe during build (no queries run at build time)
let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    const url = import.meta.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is not set');
    _sql = neon(url);
  }
  return _sql;
}

// Convenience: use as tagged template literal  →  sql`SELECT ...`
export const sql = new Proxy(
  ((...args: Parameters<ReturnType<typeof neon>>) => getDb()(...args)) as ReturnType<typeof neon>,
  {
    apply(_target, _thisArg, args) {
      return getDb()(
        ...(args as Parameters<ReturnType<typeof neon>>)
      );
    },
  }
);
