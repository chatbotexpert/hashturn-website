import type { APIRoute } from 'astro';
import { sql } from '../../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const id = data.get('id')?.toString() ?? '';
  const status = data.get('status')?.toString() ?? 'read';

  if (id) {
    await sql`UPDATE submissions SET status=${status} WHERE id=${id}`;
  }

  return redirect('/admin/submissions');
};
