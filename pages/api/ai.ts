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

  const { input } = req.body // ✅ フロントと一致させた

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'あなたは一流の営業トレーナーです。ユーザーの質問に対して、営業的な意図を汲み取り、簡潔かつ的確に答えてください。',
        },
        { role: 'user', content: input },
      ],
    })

    const result = completion.choices[0]?.message?.content ?? '（AI応答が空でした）'
    console.log('AI Response:', result)

    res.status(200).json({ result }) // ✅ resultキーで返す
  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: 'OpenAI API 呼び出しに失敗しました' })
  }
}
