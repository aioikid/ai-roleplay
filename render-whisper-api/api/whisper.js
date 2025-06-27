const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// uploads フォルダ作成
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({ dest: uploadsDir });

app.post('/api/whisper', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'no file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'converted.mp3');

  exec(`ffmpeg -i "${inputPath}" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`, async (error) => {
    if (error) {
      return res.status(500).json({ error: 'ffmpeg conversion failed' });
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(outputPath));
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      res.json({ text: response.data.text });
    } catch (apiErr) {
      console.error('OpenAI API error:', apiErr?.response?.data || apiErr.message);
      res.status(500).json({ error: 'transcription failed' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
