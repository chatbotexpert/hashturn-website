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

  const blogDir = join(process.cwd(), 'src', 'content', 'blog');
  try {
    await unlink(join(blogDir, `${slug}.md`));
  } catch {
    // Try .mdx extension
    try {
      await unlink(join(blogDir, `${slug}.mdx`));
    } catch {
      return new Response('File not found', { status: 404 });
    }
  }

  return redirect('/admin/blog');
};
