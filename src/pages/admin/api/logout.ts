import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete('ht_session', { path: '/' });
  return redirect('/admin');
};
