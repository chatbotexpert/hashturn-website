import type { APIRoute } from 'astro';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const slug = data.get('slug')?.toString().trim() ?? '';

  if (!slug) {
    return new Response('Slug is required', { status: 400 });
  }

  const filePath = join(process.cwd(), 'src', 'content', 'projects', `${slug}.md`);
  await unlink(filePath).catch(() => {}); // ignore if file doesn't exist

  return redirect('/admin/projects');
};
