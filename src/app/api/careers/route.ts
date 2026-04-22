import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql/db';
import { notifyNewApplication } from '@/lib/mysql/mailer';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://elitepartnersus.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// Handle POST - receive career application
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract text fields
    const get = (key: string): string | null => {
      const value = formData.get(key);
      return value ? String(value) : null;
    };

    const full_name = get('full_name');
    const email = get('email');

    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const conn = await getConnection();

    try {
      // Check for duplicate email
      const [existing] = await conn.execute(
        'SELECT id FROM hiring_applications WHERE email = ? LIMIT 1',
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: 'This email has already submitted an application.' },
          { status: 409, headers: corsHeaders }
        );
      }

      // Extract voice note
      const voiceFile = formData.get('voice_note') as File | null;
      let voiceBuffer: Buffer | null = null;
      let voiceName: string | null = null;
      let voiceType: string | null = null;

      if (voiceFile && voiceFile.size > 0) {
        voiceBuffer = Buffer.from(await voiceFile.arrayBuffer());
        voiceName = voiceFile.name;
        voiceType = voiceFile.type;
      }

      // Get video URL (already uploaded to Hostinger)
      const video_url = get('video_url');

      // Insert application
      await conn.execute(
        `INSERT INTO hiring_applications
          (full_name, age, city, email, whatsapp, linkedin, education, current_status,
           field, expertise_level, work_experience, english_level, other_skills,
           cover_message, voice_note, voice_note_name, voice_note_type, video_url)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          full_name,
          get('age'),
          get('city'),
          email,
          get('whatsapp'),
          get('linkedin'),
          get('education'),
          get('current_status'),
          get('field'),
          get('expertise_level'),
          get('work_experience'),
          get('english_level'),
          get('other_skills'),
          get('cover_message'),
          voiceBuffer,
          voiceName,
          voiceType,
          video_url,
        ]
      );

      // Send notification email (non-blocking)
      notifyNewApplication({
        full_name,
        email,
        whatsapp: get('whatsapp') || undefined,
        city: get('city') || undefined,
        field: get('field') || undefined,
        expertise_level: get('expertise_level') || undefined,
      }).catch((err) => console.error('Mail error:', err.message));

      return NextResponse.json(
        { success: true },
        { status: 200, headers: corsHeaders }
      );

    } finally {
      await conn.end();
    }

  } catch (err) {
    console.error('Careers API error:', err);
    return NextResponse.json(
      { error: 'Database error. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
