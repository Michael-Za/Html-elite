import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { requireAuth } from '@/lib/mysql/session';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const allowed = ['New', 'Reviewing', 'Shortlisted', 'Rejected'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const conn = await getConnection();

  try {
    await conn.execute(
      'UPDATE hiring_applications SET status = ? WHERE id = ?',
      [status, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Status update error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  } finally {
    await conn.end();
  }
}
