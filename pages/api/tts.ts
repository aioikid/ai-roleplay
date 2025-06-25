// pages/api/tts.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { text } = req.body

  const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'shimmer', // 例: "nova" / "shimmer" / "echo" / "onyx" など選択可能
      response_format: 'mp3',
    }),
  })

  const audioBuffer = await ttsRes.arrayBuffer()

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"')
  res.status(200).send(Buffer.from(audioBuffer))
}
