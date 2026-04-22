import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { requireAdmin } from '@/lib/mysql/session';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id } = await params;
  const conn = await getConnection();

  try {
    await conn.execute('DELETE FROM hiring_applications WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  } finally {
    await conn.end();
  }
}
