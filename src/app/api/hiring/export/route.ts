import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { requireAuth } from '@/lib/mysql/session';

export async function GET(req: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const conn = await getConnection();

  try {
    // Build query with filters
    let sql = `
      SELECT 
        full_name, email, whatsapp, city, field, expertise_level,
        english_level, other_skills, status, created_at
      FROM hiring_applications
      WHERE 1=1
    `;
    const params: string[] = [];

    if (search) {
      sql += ` AND (full_name LIKE ? OR email LIKE ? OR field LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await conn.execute(sql, params);

    // Build CSV
    const csvRows = [
      ['Full Name', 'Email', 'WhatsApp', 'City', 'Field', 'Expertise', 'English', 'Skills', 'Status', 'Applied Date'].join(','),
    ];

    if (Array.isArray(rows)) {
      for (const row of rows as Record<string, unknown>[]) {
        const values = [
          escapeCsv(String(row.full_name || '')),
          escapeCsv(String(row.email || '')),
          escapeCsv(String(row.whatsapp || '')),
          escapeCsv(String(row.city || '')),
          escapeCsv(String(row.field || '')),
          escapeCsv(String(row.expertise_level || '')),
          escapeCsv(String(row.english_level || '')),
          escapeCsv(String(row.other_skills || '')),
          escapeCsv(String(row.status || '')),
          escapeCsv(String(row.created_at || '')),
        ];
        csvRows.push(values.join(','));
      }
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="elite-applications.csv"',
      },
    });

  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  } finally {
    await conn.end();
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
