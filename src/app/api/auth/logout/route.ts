import { NextResponse } from 'next/server';
import { getSession } from '@/lib/mysql/session';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
