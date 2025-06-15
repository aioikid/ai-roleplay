import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: ''
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

    // Get the binary data from the request
    const body = event.isBase64Encoded ? 
      Buffer.from(event.body || '', 'base64') : 
      event.body

    if (!body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'No audio data provided' })
      }
    }

    // Create FormData for OpenAI API
    const formData = new FormData()
    const audioBlob = new Blob([body], { type: 'audio/webm' })
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'ja')

    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    })

    if (!openaiRes.ok) {
      const errorData = await openaiRes.text()
      console.error('OpenAI STT API error:', openaiRes.status, errorData)
      throw new Error(`OpenAI API error: ${openaiRes.status} ${openaiRes.statusText}`)
    }

    const data = await openaiRes.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(data)
    }
  } catch (error) {
    console.error('STT API error:', error)
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