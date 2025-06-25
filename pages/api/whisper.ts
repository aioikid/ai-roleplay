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

  // TypeScriptへの明示：Buffer[] への変換とアサーション
  const typedBuffers = buffers.map((b) => Buffer.from(b)) as unknown as readonly (Uint8Array | readonly number[])[];
  const fileBuffer = Buffer.concat(typedBuffers);

  const blob = new Blob([fileBuffer], { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('file', blob, 'audio.webm');

  res.status(200).json({ message: 'Audio received', size: fileBuffer.length });
}
