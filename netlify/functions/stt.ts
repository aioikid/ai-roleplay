// functions/_shared.ts
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': 'application/json'
} as Record<string, string>;

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { CORS_HEADERS } from './_shared.js';
import FormData from 'form-data';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const fileBuffer = Buffer.from(event.body || '', 'base64');
    const fd = new FormData();
    fd.append('file', fileBuffer, { filename: 'audio.webm' });
    fd.append('model', 'whisper-1');

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: fd as any
    });

    const data = await resp.json();
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };