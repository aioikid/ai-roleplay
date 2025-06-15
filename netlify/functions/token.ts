const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json',
      },
      body: '',
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

    // Import Twilio dynamically to avoid issues
    const { default: AccessToken } = await import('twilio/lib/jwt/AccessToken')
    const VoiceGrant = AccessToken.VoiceGrant

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

export { handler }