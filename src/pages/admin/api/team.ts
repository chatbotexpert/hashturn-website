import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readJSON, writeJSON, generateId } from '../../../utils/data';

export const prerender = false;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  avatarColor: string;
  image: string;
  linkedin: string;
  order: number;
}

async function saveImage(file: File, id: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `team-${id}-${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'team');
  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, filename), Buffer.from(bytes));
  return `/uploads/team/${filename}`;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const action = data.get('_action')?.toString() ?? 'create';

  const teams = await readJSON<TeamMember[]>('teams.json');

  if (action === 'delete') {
    const id = data.get('id')?.toString() ?? '';
    const updated = teams.filter(t => t.id !== id);
    await writeJSON('teams.json', updated);
    return redirect('/admin/team');
  }

  if (action === 'update') {
    const id = data.get('id')?.toString() ?? '';
    const idx = teams.findIndex(t => t.id === id);
    if (idx === -1) return new Response('Not found', { status: 404 });

    let image = data.get('currentImage')?.toString() ?? teams[idx].image ?? '';
    const imageFile = data.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      image = await saveImage(imageFile, id);
    }

    teams[idx] = {
      id,
      name: data.get('name')?.toString().trim() ?? '',
      role: data.get('role')?.toString().trim() ?? '',
      bio: data.get('bio')?.toString().trim() ?? '',
      avatar: data.get('avatar')?.toString().trim() ?? '',
      avatarColor: data.get('avatarColor')?.toString().trim() ?? '#22C55E',
      image,
      linkedin: data.get('linkedin')?.toString().trim() ?? '',
      order: parseInt(data.get('order')?.toString() ?? '0', 10),
    };
    await writeJSON('teams.json', teams);
    return redirect('/admin/team');
  }

  // create
  const id = generateId(teams);
  let image = '';
  const imageFile = data.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    image = await saveImage(imageFile, id);
  }

  const member: TeamMember = {
    id,
    name: data.get('name')?.toString().trim() ?? '',
    role: data.get('role')?.toString().trim() ?? '',
    bio: data.get('bio')?.toString().trim() ?? '',
    avatar: data.get('avatar')?.toString().trim() ?? '',
    avatarColor: data.get('avatarColor')?.toString().trim() ?? '#22C55E',
    image,
    linkedin: data.get('linkedin')?.toString().trim() ?? '',
    order: teams.length,
  };

  teams.push(member);
  await writeJSON('teams.json', member ? teams : teams);
  return redirect('/admin/team');
};
