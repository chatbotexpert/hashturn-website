import type { APIRoute } from 'astro';
import { sql } from '../../../../lib/db';
import { uploadImage } from '../../../../lib/blob';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const slug = data.get('slug')?.toString().trim() ?? '';
  const title = data.get('title')?.toString().trim() ?? '';
  if (!slug || !title) return new Response('Slug and title are required', { status: 400 });

  const client = data.get('client')?.toString().trim() ?? '';
  const service = data.get('service')?.toString() ?? 'Business Process Automation';
  const toolsRaw = data.get('tools')?.toString().trim() ?? '';
  const description = data.get('description')?.toString().trim() ?? '';
  const results = data.get('results')?.toString().trim() ?? '';
  const featured = data.get('featured') === 'on';
  const order = parseInt(data.get('order')?.toString() ?? '0', 10);
  const content = data.get('content')?.toString() ?? '';

  let heroImage = data.get('currentHeroImage')?.toString() ?? '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    heroImage = await uploadImage(imageFile, 'projects');
  }

  const tools = JSON.stringify(toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : []);

  await sql`
    UPDATE projects
    SET title=${title}, client=${client}, service=${service}, tools=${tools},
        description=${description}, results=${results}, hero_image=${heroImage},
        content=${content}, featured=${featured}, display_order=${order}
    WHERE slug=${slug}
  `;

  return redirect('/admin/projects');
};
