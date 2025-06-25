import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new formidable.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'File parse error' });
    }

    const file = files.file?.[0] || files.file;
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = file.filepath;
    const outputPath = path.join('/tmp', `converted-${Date.now()}.mp3`);

    try {
      // ffmpegコマンドで webm → mp3 に変換
      await execAsync(`ffmpeg -i "${inputPath}" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`);
      const mp3Buffer = fs.readFileSync(outputPath);

      const formData = new FormData();
      formData.append('file', new Blob([mp3Buffer]), 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        },
        body: formData,
      });

      const data = await response.json();
      res.status(200).json({ text: data.text });
    } catch (e) {
      console.error('Whisper変換・送信エラー:', e);
      res.status(500).json({ error: 'Transcription failed', detail: e });
    } finally {
      // 一時ファイル削除
      fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });
}
