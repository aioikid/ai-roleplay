'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [listening, setListening] = useState(false)

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

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
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
