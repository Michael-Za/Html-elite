import { getConnection } from '@/lib/mysql/db';
import { requireAuth } from '@/lib/mysql/session';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return new Response('Not logged in', { status: 401 });
  }

  const { id } = await params;
  const conn = await getConnection();

  try {
    const [rows] = await conn.execute(
      'SELECT voice_note, voice_note_type FROM hiring_applications WHERE id = ? LIMIT 1',
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response('Not found', { status: 404 });
    }

    const row = rows[0] as { voice_note: Buffer | null; voice_note_type: string | null };

    if (!row.voice_note) {
      return new Response('No voice note', { status: 404 });
    }

    return new Response(row.voice_note, {
      status: 200,
      headers: {
        'Content-Type': row.voice_note_type || 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (err) {
    console.error('Voice fetch error:', err);
    return new Response('Server error', { status: 500 });
  } finally {
    await conn.end();
  }
}
