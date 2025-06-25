import { useState } from 'react';

export default function Home() {
  const [inputText, setInputText] = useState('');

  const handleVoiceQuestion = async () => {
    if (!inputText.trim()) return;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        console.error('TTS API error:', await res.text());
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('TTS fetch failed:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AIロープレ（音声対応）</h1>
      <textarea
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="話すか、入力してください"
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleVoiceQuestion}
          style={{
            backgroundColor: '#9333ea',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
          }}
        >
          🎤 音声で質問
        </button>
      </div>
    </div>
  );
}
