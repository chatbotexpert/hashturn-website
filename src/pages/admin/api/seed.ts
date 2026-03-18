/**
 * One-time database seed endpoint.
 * Hit POST /admin/api/seed once after deploying to populate the DB
 * from the existing JSON data files and markdown content files.
 */
import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ redirect }) => {
  const errors: string[] = [];

  // Seed team members
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'teams.json'), 'utf-8');
    const teams = JSON.parse(raw) as Array<Record<string, unknown>>;
    for (const m of teams) {
      await sql`
        INSERT INTO team_members (id, name, role, bio, avatar, avatar_color, image, linkedin, display_order)
        VALUES (
          ${String(m.id)}, ${String(m.name)}, ${String(m.role ?? '')},
          ${String(m.bio ?? '')}, ${String(m.avatar ?? '')},
          ${String(m.avatarColor ?? '#22c55e')}, ${String(m.image ?? '')},
          ${String(m.linkedin ?? '')}, ${Number(m.order ?? 0)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch (e) { errors.push(`team: ${e}`); }

  // Seed reviews
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'reviews.json'), 'utf-8');
    const reviews = JSON.parse(raw) as Array<Record<string, unknown>>;
    for (const r of reviews) {
      await sql`
        INSERT INTO reviews (id, name, location, initials, rating, review_text, source, featured, created_at)
        VALUES (
          ${String(r.id)}, ${String(r.name)}, ${String(r.location ?? '')},
          ${String(r.initials ?? '')}, ${Number(r.rating ?? 5)},
          ${String(r.text ?? '')}, ${String(r.source ?? 'Google')},
          ${Boolean(r.featured)}, ${String(r.createdAt ?? new Date().toISOString())}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch (e) { errors.push(`reviews: ${e}`); }

  // Seed submissions
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'submissions.json'), 'utf-8');
    const subs = JSON.parse(raw) as Array<Record<string, unknown>>;
    for (const s of subs) {
      await sql`
        INSERT INTO submissions (id, name, email, company, budget, service, message, how, tools, timeline, source, status, submitted_at)
        VALUES (
          ${String(s.id)}, ${String(s.name)}, ${String(s.email)},
          ${String(s.company ?? '')}, ${String(s.budget ?? '')},
          ${String(s.service ?? '')}, ${String(s.message)},
          ${String(s.how ?? '')}, ${String(s.tools ?? '')},
          ${String(s.timeline ?? '')}, ${String(s.source ?? 'contact')},
          ${String(s.status ?? 'new')}, ${String(s.submittedAt ?? new Date().toISOString())}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch (e) { errors.push(`submissions: ${e}`); }

  // Seed blog posts from markdown files
  try {
    const blogDir = join(process.cwd(), 'src', 'content', 'blog');
    const files = (await readdir(blogDir)).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const raw = await readFile(join(blogDir, file), 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!fmMatch) continue;
      const fm = fmMatch[1];
      const content = fmMatch[2].trim();

      const get = (key: string) => fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim() ?? '';
      const tagsMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
      const tagsArray = tagsMatch?.[1]
        ? tagsMatch[1].split(',').map(t => t.trim().replace(/^"|"$/g, '')).filter(Boolean)
        : [];

      await sql`
        INSERT INTO blog_posts (slug, title, description, pub_date, author, tags, hero_image, content)
        VALUES (
          ${slug}, ${get('title')}, ${get('description')},
          ${get('pubDate') || new Date().toISOString().split('T')[0]},
          ${get('author') || 'HashTurn Team'},
          ${JSON.stringify(tagsArray)}, ${get('heroImage')}, ${content}
        )
        ON CONFLICT (slug) DO NOTHING
      `;
    }
  } catch (e) { errors.push(`blog: ${e}`); }

  // Seed projects from markdown files
  try {
    const projectsDir = join(process.cwd(), 'src', 'content', 'projects');
    const files = (await readdir(projectsDir)).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const raw = await readFile(join(projectsDir, file), 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!fmMatch) continue;
      const fm = fmMatch[1];
      const content = fmMatch[2].trim();

      const get = (key: string) => fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim() ?? '';
      const toolsMatch = fm.match(/^tools:\s*\[([^\]]*)\]/m);
      const toolsArray = toolsMatch?.[1]
        ? toolsMatch[1].split(',').map(t => t.trim().replace(/^"|"$/g, '')).filter(Boolean)
        : [];

      await sql`
        INSERT INTO projects (slug, title, client, service, tools, description, results, hero_image, content, featured, display_order)
        VALUES (
          ${slug}, ${get('title')}, ${get('client')}, ${get('service')},
          ${JSON.stringify(toolsArray)}, ${get('description')}, ${get('results')},
          ${get('heroImage')}, ${content},
          ${fm.includes('featured: true')}, ${parseInt(get('order') || '0', 10)}
        )
        ON CONFLICT (slug) DO NOTHING
      `;
    }
  } catch (e) { errors.push(`projects: ${e}`); }

  if (errors.length > 0) {
    return new Response(JSON.stringify({ ok: false, errors }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, message: 'Database seeded successfully!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
