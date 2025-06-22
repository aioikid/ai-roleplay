// pages/api/ai.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 必ず環境変数で設定する
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
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o', // または 'gpt-3.5-turbo' も可
      messages: [
        { role: 'system', content: 'あなたは優秀な営業トレーナーです。' },
        { role: 'user', content: input },
      ],
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'エラー：返答が取得できませんでした。'
    return res.status(200).json({ result: aiResponse })
  } catch (err: any) {
    console.error('OpenAI error:', err)
    return res.status(500).json({ error: 'AI応答の取得に失敗しました' })
  }
}
