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

  if (event.httpMethod !== 'POST') {
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
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      }
    }

    const { text, voice } = JSON.parse(event.body || '{}')

    if (!text) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Text is required' })
      }
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice: voice || 'nova',
        input: text.substring(0, 4096) // Limit text length
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI TTS API error:', response.status, errorData)
      throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
      body: Buffer.from(audioBuffer).toString('base64'),
      isBase64Encoded: true
    }
  } catch (error) {
    console.error('TTS API error:', error)
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