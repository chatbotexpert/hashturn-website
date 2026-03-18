import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const action = data.get('_action')?.toString() ?? 'create';

  if (action === 'delete') {
    const id = data.get('id')?.toString() ?? '';
    if (id) await sql`DELETE FROM reviews WHERE id=${id}`;
    return redirect('/admin/reviews');
  }

  const name = data.get('name')?.toString().trim() ?? '';
  const location = data.get('location')?.toString().trim() ?? '';
  const initials = data.get('initials')?.toString().trim() ?? '';
  const rating = parseInt(data.get('rating')?.toString() ?? '5', 10);
  const text = data.get('text')?.toString().trim() ?? '';
  const source = data.get('source')?.toString().trim() || 'Google';
  const featured = data.get('featured') === 'on';

  if (action === 'update') {
    const id = data.get('id')?.toString() ?? '';
    await sql`
      UPDATE reviews
      SET name=${name}, location=${location}, initials=${initials},
          rating=${rating}, review_text=${text}, source=${source}, featured=${featured}
      WHERE id=${id}
    `;
    return redirect('/admin/reviews');
  }

  // create
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO reviews (id, name, location, initials, rating, review_text, source, featured)
    VALUES (${id}, ${name}, ${location}, ${initials}, ${rating}, ${text}, ${source}, ${featured})
  `;
  return redirect('/admin/reviews');
};
