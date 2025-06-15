import { jwt } from 'twilio';
const { AccessToken } = jwt;
const { VoiceGrant } = AccessToken;

export async function handler(event: any) {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY_SID!,
    process.env.TWILIO_API_KEY_SECRET!,
    { identity: 'test_user' }
  );

  const voiceGrant = new VoiceGrant({ outgoingApplicationSid: process.env.TWIML_APP_SID! });
  token.addGrant(voiceGrant);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: token.toJwt() })
  };
}