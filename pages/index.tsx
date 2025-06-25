'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [listening, setListening] = useState(false)
  const [recording, setRecording] = useState(false) // ✅ 録音用

  const handleSubmit = async () => {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    })
    const data = await res.json()
    const answer = data.result || '返信なし'
    setReply(answer)

    // 音声出力
    const utterance = new SpeechSynthesisUtterance(answer)
    utterance.lang = 'ja-JP'
    speechSynthesis.speak(utterance)
  }

  // 🎤 Whisper用 音声録音して /api/whisper に送信
  const handleSTT = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const res = await fetch('/api/whisper', {
        method: 'POST',
        body: blob,
      })
      const data = await res.json()
      setInput(data.text || '') // Whisper結果を入力欄に
      setRecording(false)
    }

    mediaRecorder.start()
    setRecording(true)
    setTimeout(() => mediaRecorder.stop(), 5000) // ⏱ 録音時間
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('音声認識はこのブラウザでサポートされていません。')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event: Event) => {
      const result = (event as any).results?.[0]?.[0]?.transcript
      if (result) setInput(result)
      setListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('認識エラー', event.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">AIロープレ（音声対応）</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full max-w-md h-32 p-2 border rounded mb-2"
        placeholder="話すか、入力してください"
      />
      <div className="flex space-x-2 mb-4">
        <button
          onClick={startListening}
          className={`px-4 py-2 rounded text-white ${listening ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80`}
        >
          {listening ? '録音中...' : '🎤 話す'}
        </button>
        <button
          onClick={handleSTT}
          className={`px-4 py-2 rounded text-white ${recording ? 'bg-red-600' : 'bg-purple-600'} hover:opacity-80`}
        >
          {recording ? '録音中...' : '🎤 音声で質問'}
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          送信
        </button>
      </div>
      <div className="mt-4 p-2 bg-white border rounded max-w-md w-full min-h-[50px]">
        {reply}
      </div>
    </main>
  )
}
