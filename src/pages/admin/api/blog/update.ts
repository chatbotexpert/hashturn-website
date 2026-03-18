import type { APIRoute } from 'astro';
import { sql } from '../../../../lib/db';
import { uploadImage } from '../../../../lib/blob';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const slug = data.get('slug')?.toString().trim() ?? '';
  const title = data.get('title')?.toString().trim() ?? '';
  if (!slug || !title) return new Response('Slug and title are required', { status: 400 });

  const description = data.get('description')?.toString().trim() ?? '';
  const pubDate = data.get('pubDate')?.toString() ?? '';
  const updatedDate = data.get('updatedDate')?.toString() || null;
  const author = data.get('author')?.toString().trim() || 'HashTurn Team';
  const tagsRaw = data.get('tags')?.toString().trim() ?? '';
  const content = data.get('content')?.toString() ?? '';

  let heroImage = data.get('currentHeroImage')?.toString() ?? '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    heroImage = await uploadImage(imageFile, 'blog');
  }

  const tags = JSON.stringify(tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []);

  await sql`
    UPDATE blog_posts
    SET title=${title}, description=${description}, pub_date=${pubDate},
        updated_date=${updatedDate}, author=${author}, tags=${tags},
        hero_image=${heroImage}, content=${content}
    WHERE slug=${slug}
  `;

  return redirect('/admin/blog');
};
