import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const title = data.get('title')?.toString().trim() ?? '';
  const client = data.get('client')?.toString().trim() ?? '';
  const service = data.get('service')?.toString() ?? 'Business Process Automation';
  const toolsRaw = data.get('tools')?.toString().trim() ?? '';
  const description = data.get('description')?.toString().trim() ?? '';
  const results = data.get('results')?.toString().trim() ?? '';
  const featured = data.get('featured') === 'on';
  const order = parseInt(data.get('order')?.toString() ?? '0', 10);
  const content = data.get('content')?.toString() ?? '';

  if (!title) {
    return new Response('Title is required', { status: 400 });
  }

  const slug = toSlug(title);

  // Handle hero image upload
  let heroImage = '';
  const imageFile = data.get('heroImage') as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${slug}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'projects');
    await mkdir(uploadDir, { recursive: true });
    const bytes = await imageFile.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));
    heroImage = `/uploads/projects/${filename}`;
  }

  const toolsArray = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const toolsYaml = toolsArray.length > 0
    ? `[${toolsArray.map(t => `"${t}"`).join(', ')}]`
    : '[]';

  const heroImageYaml = heroImage ? `\nheroImage: "${heroImage}"` : '';

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
client: "${client.replace(/"/g, '\\"')}"
service: "${service}"
tools: ${toolsYaml}
description: "${description.replace(/"/g, '\\"')}"
results: "${results.replace(/"/g, '\\"')}"
featured: ${featured}
order: ${order}${heroImageYaml}
---

${content}`;

  const projectsDir = join(process.cwd(), 'src', 'content', 'projects');
  await mkdir(projectsDir, { recursive: true });
  await writeFile(join(projectsDir, `${slug}.md`), frontmatter, 'utf-8');

  return redirect('/admin/projects');
};
