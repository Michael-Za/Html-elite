import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { getSession } from '@/lib/mysql/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    try {
      const [rows] = await conn.execute(
        'SELECT id, name, email, role FROM crm_users WHERE email = ? AND password = ? LIMIT 1',
        [email, password]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = rows[0] as { id: number; name: string; email: string; role: string };

      // Create session
      const session = await getSession();
      session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'ADMIN' | 'MANAGER',
      };
      await session.save();

      return NextResponse.json({
        success: true,
        user: session.user,
      });

    } finally {
      await conn.end();
    }

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
