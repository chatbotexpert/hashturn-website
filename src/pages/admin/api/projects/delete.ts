import type { APIRoute } from 'astro';
import { sql } from '../../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const slug = data.get('slug')?.toString().trim() ?? '';
  if (slug) {
    await sql`DELETE FROM projects WHERE slug=${slug}`;
  }
  return redirect('/admin/projects');
};
