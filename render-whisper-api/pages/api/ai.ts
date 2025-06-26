import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    })

    const result = chatCompletion.choices[0]?.message?.content || '回答が得られませんでした'
    res.status(200).json({ result })
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: 'API Error', details: error.message })
  }
}
