import { Handler } from '@netlify/functions';
import twilio from 'twilio';

export const handler: Handler = async (event) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const apiKeySid = process.env.TWILIO_API_KEY_SID!;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET!;
  const appSid = process.env.TWIML_APP_SID!;

  const identity = 'test_user';
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: appSid,
  });

  const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity });
  token.addGrant(voiceGrant);

  return {
    statusCode: 200,
    body: JSON.stringify({ token: token.toJwt() }),
  };
};
