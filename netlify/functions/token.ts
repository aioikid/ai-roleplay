// functions/_shared.ts
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': 'application/json'
} as Record<string, string>;

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { jwt } from 'twilio';
import { CORS_HEADERS } from './_shared.js';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const identity = (event.queryStringParameters?.identity) || 'test_user';
  const AccessToken = jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY_SID!,
    process.env.TWILIO_API_KEY_SECRET!,
    { identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID!,
    incomingAllow: true
  });

  token.addGrant(voiceGrant);
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ token: token.toJwt() }) };
};

export { handler };