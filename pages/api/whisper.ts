import type { NextApiRequest, NextApiResponse } from 'next';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buffers: Uint8Array[] = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const fileBuffer = Buffer.concat(buffers as any);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), 'audio.webm'); // ← 明示的にBlob
  formData.append('model', 'whisper-1');
  formData.append('language', 'ja'); // ← 日本語指定（省略可）

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.text) {
      console.error('🟥 Whisper API レスポンスに text がありません:', data);
      return res.status(500).json({ error: 'No text in Whisper response', raw: data });
    }

    res.status(200).json({ text: data.text });
  } catch (err) {
    console.error('🟥 Whisper API エラー:', err);
    res.status(500).json({ error: 'Whisper transcription failed' });
  }
}
