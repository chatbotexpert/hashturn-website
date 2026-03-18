import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), 'data');

export async function readJSON<T = unknown>(filename: string): Promise<T> {
  const path = join(DATA_DIR, filename);
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJSON(filename: string, data: unknown): Promise<void> {
  const path = join(DATA_DIR, filename);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateId(items: { id: string }[]): string {
  if (items.length === 0) return '1';
  const maxId = Math.max(...items.map((i) => parseInt(i.id, 10) || 0));
  return String(maxId + 1);
}
