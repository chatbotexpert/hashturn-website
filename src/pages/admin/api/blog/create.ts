import type { APIRoute } from 'astro';
import { sql } from '../../../../lib/db';
import { uploadImage } from '../../../../lib/blob';

export const prerender = false;

function toSlug(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const title = data.get('title')?.toString().trim() ?? '';
  if (!title) return new Response('Title is required', { status: 400 });

  const slug = toSlug(title);
  const description = data.get('description')?.toString().trim() ?? '';
  const pubDate = data.get('pubDate')?.toString() ?? new Date().toISOString().split('T')[0];
  const author = data.get('author')?.toString().trim() || 'HashTurn Team';
  const tagsRaw = data.get('tags')?.toString().trim() ?? '';
  const content = data.get('content')?.toString() ?? '';

  let heroImage = '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    heroImage = await uploadImage(imageFile, 'blog');
  }

  const tags = JSON.stringify(tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []);

  await sql`
    INSERT INTO blog_posts (slug, title, description, pub_date, author, tags, hero_image, content)
    VALUES (${slug}, ${title}, ${description}, ${pubDate}, ${author}, ${tags}, ${heroImage}, ${content})
    ON CONFLICT (slug) DO NOTHING
  `;

  return redirect('/admin/blog');
};
