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
  const client = data.get('client')?.toString().trim() ?? '';
  const service = data.get('service')?.toString() ?? 'Business Process Automation';
  const toolsRaw = data.get('tools')?.toString().trim() ?? '';
  const description = data.get('description')?.toString().trim() ?? '';
  const results = data.get('results')?.toString().trim() ?? '';
  const featured = data.get('featured') === 'on';
  const order = parseInt(data.get('order')?.toString() ?? '0', 10);
  const content = data.get('content')?.toString() ?? '';

  let heroImage = '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    heroImage = await uploadImage(imageFile, 'projects');
  }

  const tools = JSON.stringify(toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : []);

  await sql`
    INSERT INTO projects (slug, title, client, service, tools, description, results, hero_image, content, featured, display_order)
    VALUES (${slug}, ${title}, ${client}, ${service}, ${tools}, ${description}, ${results}, ${heroImage}, ${content}, ${featured}, ${order})
    ON CONFLICT (slug) DO NOTHING
  `;

  return redirect('/admin/projects');
};
