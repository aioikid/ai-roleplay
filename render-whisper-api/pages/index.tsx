import { useState } from 'react';

export default function Home() {
  const [inputText, setInputText] = useState('');

  // 🟣 録音してWhisperに送る関数（デバッグ付き）
  const handleRecordAndTranscribe = async () => {
    console.log('🟣 録音開始');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 録音停止、Whisperへ送信開始');

        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');

        const res = await fetch('/api/whisper', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          console.error('Whisper API エラー:', await res.text());
          return;
        }

        const data = await res.json();
        console.log('📝 取得したテキスト:', data.text);
        setInputText(data.text || '');
      };

      mediaRecorder.start();
      console.log('🎙 録音中...');

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 5000);
    } catch (err) {
      console.error('🎤 録音エラー:', err);
    }
  };

  // 🔵 入力テキストをTTSで再生する関数
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
        console.error('TTS API エラー:', await res.text());
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('TTS fetch 失敗:', err);
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
          onClick={handleRecordAndTranscribe}
          style={{
            backgroundColor: '#9333ea',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
          }}
        >
          🎤 音声で質問
        </button>
        <button
          onClick={handleVoiceQuestion}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
          }}
        >
          📢 送信
        </button>
      </div>
    </div>
  );
}
