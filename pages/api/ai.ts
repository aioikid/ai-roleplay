// pages/api/ai.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input } = req.body
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'あなたは優秀な営業トレーナーです。簡潔で具体的に答えてください。' },
        { role: 'user', content: input },
      ],
    })

    const result = completion.choices[0]?.message?.content ?? '（AI応答が空でした）'
    res.status(200).json({ result })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'OpenAI API 呼び出しに失敗しました' })
  }
}
