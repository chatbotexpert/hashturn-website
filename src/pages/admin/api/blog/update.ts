import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const slug = data.get('slug')?.toString().trim() ?? '';
  const title = data.get('title')?.toString().trim() ?? '';
  const description = data.get('description')?.toString().trim() ?? '';
  const pubDate = data.get('pubDate')?.toString() ?? new Date().toISOString().split('T')[0];
  const tags = data.get('tags')?.toString().trim() ?? '';
  const author = data.get('author')?.toString().trim() ?? 'HashTurn Team';
  const content = data.get('content')?.toString() ?? '';

  if (!slug || !title) {
    return new Response('Slug and title are required', { status: 400 });
  }

  // Handle image upload
  let heroImage = data.get('currentHeroImage')?.toString() ?? '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${slug}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
    await mkdir(uploadDir, { recursive: true });
    const bytes = await imageFile.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));
    heroImage = `/uploads/blog/${filename}`;
  }

  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const tagsYaml = tagArray.length > 0
    ? `\ntags: [${tagArray.map(t => `"${t}"`).join(', ')}]`
    : '';
  const heroImageYaml = heroImage ? `\nheroImage: "${heroImage}"` : '';

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
author: "${author}"${tagsYaml}${heroImageYaml}
---

${content}`;

  const blogDir = join(process.cwd(), 'src', 'content', 'blog');
  await writeFile(join(blogDir, `${slug}.md`), frontmatter, 'utf-8');

  return redirect('/admin/blog');
};
