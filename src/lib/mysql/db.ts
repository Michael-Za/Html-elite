import mysql from 'mysql2/promise';

export async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

// Helper to run queries with automatic connection handling
export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows as T[];
  } finally {
    await conn.end();
  }
}

// Helper for INSERT/UPDATE/DELETE
export async function execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number; insertId: number }> {
  const conn = await getConnection();
  try {
    const [result] = await conn.execute(sql, params);
    return result as { affectedRows: number; insertId: number };
  } finally {
    await conn.end();
  }
}
