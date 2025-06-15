// functions/_shared.ts
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': 'application/json'
} as Record<string, string>;

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { CORS_HEADERS } from './_shared.js';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { text, voice = 'nova' } = body;

    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: 'tts-1-hd', voice, input: text })
    });

    const arrayBuffer = await resp.arrayBuffer();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*' },
      body: Buffer.from(arrayBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };