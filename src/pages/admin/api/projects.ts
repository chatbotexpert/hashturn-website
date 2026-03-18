import type { APIRoute } from 'astro';
import { readJSON, writeJSON, generateId } from '../../../utils/data';

export const prerender = false;

interface Project {
  id: string;
  title: string;
  client: string;
  service: string;
  tools: string[];
  description: string;
  results: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const action = data.get('_action')?.toString() ?? 'create';

  const projects = await readJSON<Project[]>('projects.json');

  if (action === 'delete') {
    const id = data.get('id')?.toString() ?? '';
    await writeJSON('projects.json', projects.filter(p => p.id !== id));
    return redirect('/admin/projects');
  }

  const toolsRaw = data.get('tools')?.toString().trim() ?? '';
  const tools = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (action === 'update') {
    const id = data.get('id')?.toString() ?? '';
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return new Response('Not found', { status: 404 });

    projects[idx] = {
      id,
      title: data.get('title')?.toString().trim() ?? '',
      client: data.get('client')?.toString().trim() ?? '',
      service: data.get('service')?.toString().trim() ?? '',
      tools,
      description: data.get('description')?.toString().trim() ?? '',
      results: data.get('results')?.toString().trim() ?? '',
      featured: data.get('featured') === 'on',
      order: projects[idx].order,
      createdAt: projects[idx].createdAt,
    };
    await writeJSON('projects.json', projects);
    return redirect('/admin/projects');
  }

  // create
  const project: Project = {
    id: generateId(projects),
    title: data.get('title')?.toString().trim() ?? '',
    client: data.get('client')?.toString().trim() ?? '',
    service: data.get('service')?.toString().trim() ?? '',
    tools,
    description: data.get('description')?.toString().trim() ?? '',
    results: data.get('results')?.toString().trim() ?? '',
    featured: data.get('featured') === 'on',
    order: projects.length,
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
  await writeJSON('projects.json', projects);
  return redirect('/admin/projects');
};
