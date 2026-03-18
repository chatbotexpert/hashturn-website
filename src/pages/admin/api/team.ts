import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';
import { uploadImage } from '../../../lib/blob';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const action = data.get('_action')?.toString() ?? 'create';

  if (action === 'delete') {
    const id = data.get('id')?.toString() ?? '';
    if (id) await sql`DELETE FROM team_members WHERE id=${id}`;
    return redirect('/admin/team');
  }

  const name = data.get('name')?.toString().trim() ?? '';
  const role = data.get('role')?.toString().trim() ?? '';
  const bio = data.get('bio')?.toString().trim() ?? '';
  const avatar = data.get('avatar')?.toString().trim() ?? '';
  const avatarColor = data.get('avatarColor')?.toString().trim() || '#22C55E';
  const linkedin = data.get('linkedin')?.toString().trim() ?? '';
  const order = parseInt(data.get('order')?.toString() ?? '0', 10);

  if (action === 'update') {
    const id = data.get('id')?.toString() ?? '';
    let image = data.get('currentImage')?.toString() ?? '';
    const imageFile = data.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      image = await uploadImage(imageFile, 'team');
    }

    await sql`
      UPDATE team_members
      SET name=${name}, role=${role}, bio=${bio}, avatar=${avatar},
          avatar_color=${avatarColor}, image=${image}, linkedin=${linkedin}, display_order=${order}
      WHERE id=${id}
    `;
    return redirect('/admin/team');
  }

  // create
  const id = crypto.randomUUID();
  let image = '';
  const imageFile = data.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    image = await uploadImage(imageFile, 'team');
  }

  await sql`
    INSERT INTO team_members (id, name, role, bio, avatar, avatar_color, image, linkedin, display_order)
    VALUES (${id}, ${name}, ${role}, ${bio}, ${avatar}, ${avatarColor}, ${image}, ${linkedin}, ${order})
  `;
  return redirect('/admin/team');
};
