const formidable = require('formidable');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.post('/api/whisper', (req, res) => {
  const form = new formidable.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'parse error', detail: err });

    const file = files.file;
    if (!file || !file.filepath) return res.status(400).json({ error: 'no file uploaded' });

    const inputPath = file.filepath;
    const outputPath = path.join('/tmp', `converted-${Date.now()}.mp3`);

    try {
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${inputPath}" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      const mp3Buffer = fs.readFileSync(outputPath);
      const formData = new FormData();
      formData.append('file', new Blob([mp3Buffer]), 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja');

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
        },
        body: formData,
      });

      const data = await whisperRes.json();
      res.status(200).json({ text: data.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'conversion failed', detail: e });
    } finally {
      fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
