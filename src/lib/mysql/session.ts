import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
}

export interface SessionData {
  user?: SessionUser;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'elite_crm_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.user) {
    return null;
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}
