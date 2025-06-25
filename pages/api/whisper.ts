// pages/api/whisper.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const formData = new FormData()
  const buffers: Buffer[] = []

  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk) => buffers.push(chunk))
    req.on('end', () => resolve())
    req.on('error', reject)
  })

  const fileBuffer = Buffer.concat(buffers)
  const blob = new Blob([fileBuffer], { type: 'audio/webm' })

  formData.append('file', blob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'text')
  formData.append('language', 'ja')

  const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: formData as any,
  })

  const text = await openaiRes.text()
  res.status(200).json({ text })
}
