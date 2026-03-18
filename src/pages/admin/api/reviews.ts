import type { APIRoute } from 'astro';
import { readJSON, writeJSON, generateId } from '../../../utils/data';

export const prerender = false;

interface Review {
  id: string;
  name: string;
  location: string;
  initials: string;
  rating: number;
  text: string;
  source: string;
  featured: boolean;
  createdAt: string;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const action = data.get('_action')?.toString() ?? 'create';

  const reviews = await readJSON<Review[]>('reviews.json');

  if (action === 'delete') {
    const id = data.get('id')?.toString() ?? '';
    await writeJSON('reviews.json', reviews.filter(r => r.id !== id));
    return redirect('/admin/reviews');
  }

  if (action === 'update') {
    const id = data.get('id')?.toString() ?? '';
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return new Response('Not found', { status: 404 });

    reviews[idx] = {
      id,
      name: data.get('name')?.toString().trim() ?? '',
      location: data.get('location')?.toString().trim() ?? '',
      initials: data.get('initials')?.toString().trim() ?? '',
      rating: parseInt(data.get('rating')?.toString() ?? '5', 10),
      text: data.get('text')?.toString().trim() ?? '',
      source: data.get('source')?.toString().trim() ?? 'Google',
      featured: data.get('featured') === 'on',
      createdAt: reviews[idx].createdAt,
    };
    await writeJSON('reviews.json', reviews);
    return redirect('/admin/reviews');
  }

  // create
  const review: Review = {
    id: generateId(reviews),
    name: data.get('name')?.toString().trim() ?? '',
    location: data.get('location')?.toString().trim() ?? '',
    initials: data.get('initials')?.toString().trim() ?? '',
    rating: parseInt(data.get('rating')?.toString() ?? '5', 10),
    text: data.get('text')?.toString().trim() ?? '',
    source: data.get('source')?.toString().trim() ?? 'Google',
    featured: data.get('featured') === 'on',
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);
  await writeJSON('reviews.json', reviews);
  return redirect('/admin/reviews');
};
