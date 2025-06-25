import type { NextApiRequest, NextApiResponse } from 'next';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const buffers: Uint8Array[] = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  // Bufferに変換して結合
  const typedBuffers: Buffer[] = buffers.map((b) => Buffer.from(b));
  const fileBuffer = Buffer.concat(typedBuffers);

  const blob = new Blob([fileBuffer], { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('file', blob, 'audio.webm');

  // 必要であればここで fetch で Whisper API などへ送信
  // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { ... })

  res.status(200).json({ message: 'Audio received', size: fileBuffer.length });
}
