import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { order } = await request.json() as { order: string[] };
    if (!Array.isArray(order)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }
    for (let i = 0; i < order.length; i++) {
      await sql`UPDATE team_members SET display_order=${i + 1} WHERE id=${order[i]}`;
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to update order' }), { status: 500 });
  }
};
