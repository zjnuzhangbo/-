import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET') || 'change-me-to-a-random-string';
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = await create(
      { alg: 'HS256', typ: 'JWT' },
      { role: 'admin', exp: getNumericDate(60 * 60 * 24) },
      new TextEncoder().encode(JWT_SECRET),
    );

    return new Response(JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
