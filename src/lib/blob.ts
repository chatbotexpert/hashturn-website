import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Upload an image file.
 * - On Vercel (BLOB_READ_WRITE_TOKEN set): uploads to Vercel Blob CDN, returns CDN URL.
 * - Locally (no token): saves to public/uploads/, returns local path.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${folder}/${Date.now()}.${ext}`;

  const token = import.meta.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(filename, file, { access: 'public', token });
    return blob.url;
  }

  // Local dev fallback — write to public/uploads/
  const localFilename = `${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, localFilename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${localFilename}`;
}
