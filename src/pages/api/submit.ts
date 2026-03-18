import type { APIRoute } from 'astro';
import { generateId, readJSON, writeJSON } from '../../utils/data';

export const prerender = false;

interface Submission {
  id: string;
  name: string;
  email: string;
  company: string;
  budget: string;
  service: string;
  message: string;
  how: string;
  tools?: string;
  timeline?: string;
  source: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  submittedAt: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    // Honeypot check — bots fill this field, humans leave it blank
    const honey = data.get('_honey')?.toString() ?? '';
    if (honey) {
      // Silently succeed to not tip off bots
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cloudflare Turnstile verification
    const turnstileToken = data.get('cf-turnstile-response')?.toString() ?? '';
    const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY ?? '1x0000000000000000000000000000000AA'; // demo secret (always passes)

    if (turnstileSecret && !turnstileSecret.startsWith('1x0000')) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') ?? '',
        }),
      });
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: 'Captcha verification failed. Please try again.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const name = data.get('name')?.toString().trim() ?? '';
    const email = data.get('email')?.toString().trim() ?? '';
    const message = data.get('message')?.toString().trim() ?? '';

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const submissions = await readJSON<Submission[]>('submissions.json');

    const entry: Submission = {
      id: generateId(submissions),
      name,
      email,
      company: data.get('company')?.toString().trim() ?? '',
      budget: data.get('budget')?.toString() ?? '',
      service: data.get('service')?.toString() ?? '',
      message,
      how: data.get('how')?.toString() ?? '',
      tools: data.get('tools')?.toString().trim() ?? '',
      timeline: data.get('timeline')?.toString() ?? '',
      source: data.get('source')?.toString() ?? 'contact',
      status: 'new',
      submittedAt: new Date().toISOString(),
    };

    submissions.push(entry);
    await writeJSON('submissions.json', submissions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Form submission error:', err);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
