import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';

export const prerender = false;

// To change credentials, update these constants:
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Admin0900';
const SESSION_SECRET = 'hashturn-admin-secret-2025';
const SESSION_COOKIE = 'ht_session';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const data = await request.formData();
  const username = data.get('username')?.toString() ?? '';
  const password = data.get('password')?.toString() ?? '';

  let valid = false;
  try {
    const userBuf = Buffer.from(username.padEnd(ADMIN_USER.length));
    const passBuf = Buffer.from(password.padEnd(ADMIN_PASS.length));
    const userMatch = timingSafeEqual(userBuf, Buffer.from(ADMIN_USER.padEnd(ADMIN_USER.length)));
    const passMatch = timingSafeEqual(passBuf, Buffer.from(ADMIN_PASS.padEnd(ADMIN_PASS.length)));
    valid = userMatch && passMatch && username === ADMIN_USER && password === ADMIN_PASS;
  } catch {
    valid = false;
  }

  if (valid) {
    cookies.set(SESSION_COOKIE, SESSION_SECRET, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    return redirect('/admin/dashboard');
  }

  return redirect('/admin?error=1');
};
