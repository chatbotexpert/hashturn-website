import { defineMiddleware } from 'astro:middleware';

const SESSION_COOKIE = 'ht_session';
export const SESSION_SECRET = 'hashturn-admin-secret-2025';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only guard /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // Login page and login API are always accessible
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname === '/admin/api/login' ||
    pathname === '/admin/api/login/'
  ) {
    return next();
  }

  const sessionCookie = context.cookies.get(SESSION_COOKIE);
  const isAuthenticated = sessionCookie?.value === SESSION_SECRET;

  if (!isAuthenticated) {
    // API routes return 401, page routes redirect to login
    if (pathname.startsWith('/admin/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin');
  }

  return next();
});
