import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { requireAuth } from '@/lib/mysql/session';

// GET - List all applications with pagination and stats
export async function GET(req: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 25;
  const offset = (page - 1) * limit;

  const conn = await getConnection();

  try {
    // Get stats
    const [statsRows] = await conn.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'Reviewing' THEN 1 ELSE 0 END) as reviewing_count,
        SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM hiring_applications
    `);

    // Get applications (without voice_note binary for performance)
    const [applications] = await conn.execute(`
      SELECT 
        id, full_name, age, city, email, whatsapp, linkedin, education,
        current_status, field, expertise_level, work_experience, english_level,
        other_skills, cover_message, voice_note_name, voice_note_type, video_url,
        status, created_at,
        CASE WHEN voice_note IS NOT NULL THEN 1 ELSE 0 END as has_voice
      FROM hiring_applications
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Get total for pagination
    const [countRows] = await conn.execute('SELECT COUNT(*) as total FROM hiring_applications');

    const stats = Array.isArray(statsRows) && statsRows[0] ? statsRows[0] : { total: 0, new_count: 0, reviewing_count: 0, shortlisted_count: 0, rejected_count: 0 };
    const total = Array.isArray(countRows) && countRows[0] ? (countRows[0] as { total: number }).total : 0;

    return NextResponse.json({
      stats,
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      user,
    });

  } finally {
    await conn.end();
  }
}
