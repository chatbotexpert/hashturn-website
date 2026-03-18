import type { APIRoute } from 'astro';
import { readJSON, writeJSON } from '../../../../utils/data';

export const prerender = false;

interface Submission {
  id: string;
  status: string;
  [key: string]: unknown;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const id = data.get('id')?.toString() ?? '';
  const status = data.get('status')?.toString() ?? 'read';

  const submissions = await readJSON<Submission[]>('submissions.json');
  const idx = submissions.findIndex(s => s.id === id);
  if (idx !== -1) {
    submissions[idx].status = status;
    await writeJSON('submissions.json', submissions);
  }

  return redirect('/admin/submissions');
};
