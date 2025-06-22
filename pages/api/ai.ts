// pages/api/ai.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { prompt } = req.body

    // ここに任意のAPI連携（OpenAIなど）を書く
    const reply = `「${prompt}」に対してAIが返答したよ！（仮）`

    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
