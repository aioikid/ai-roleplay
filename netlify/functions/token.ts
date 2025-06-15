import { Handler } from '@netlify/functions'
import AccessToken from 'twilio/lib/jwt/AccessToken'
const VoiceGrant = AccessToken.VoiceGrant

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const identity = event.queryStringParameters?.identity || 'test_user'

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const apiKeySid = process.env.TWILIO_API_KEY_SID
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET
    const twimlAppSid = process.env.TWIML_APP_SID

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      console.error('Missing Twilio configuration:', {
        accountSid: !!accountSid,
        apiKeySid: !!apiKeySid,
        apiKeySecret: !!apiKeySecret,
        twimlAppSid: !!twimlAppSid
      })
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing Twilio configuration' })
      }
    }

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity })
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true
    })

    token.addGrant(voiceGrant)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ token: token.toJwt() })
    }
  } catch (error) {
    console.error('Token generation error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}