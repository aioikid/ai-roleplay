import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const { message } = JSON.parse(event.body || '{}');

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: message }],
  });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ reply: chat.choices[0].message.content }),
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Content-Type': 'application/json',
};
