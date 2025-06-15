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
    const messages = body.messages ?? [];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'あなたは営業ロープレAIです。新人営業の指導役です。丁寧に詰めてください。' },
          ...messages
        ]
      })
    });

    const data = await resp.json();
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

export { handler };