const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/whisper', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'no file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.mp3`;

    // ffmpeg で .webm → .mp3 に変換
    exec(`ffmpeg -i "${inputPath}" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`, async (error) => {
      if (error) {
        console.error('ffmpeg error:', error);
        return res.status(500).json({ error: 'ffmpeg conversion failed' });
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(outputPath));
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja'); // 日本語指定

      try {
        const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
          }
        });

        // 後片付け
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        return res.status(200).json({ text: whisperRes.data.text });
      } catch (err) {
        console.error('OpenAI Whisper error:', err.response?.data || err.message);
        return res.status(500).json({ error: 'transcription failed' });
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// ✅ Render.com 用: ポートを指定して起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Whisper API server is running on port ${PORT}`);
});
