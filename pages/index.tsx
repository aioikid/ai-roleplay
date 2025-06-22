// pages/index.tsx
'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')

  const handleSubmit = async () => {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    })
    const data = await res.json()
    setReply(data.reply || '返信なし')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">AIロープレ</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full max-w-md h-40 p-2 border rounded mb-2"
        placeholder="ロープレの入力をここに..."
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        送信
      </button>
      <div className="mt-4 p-2 bg-white border rounded max-w-md w-full min-h-[50px]">
        {reply}
      </div>
    </main>
  )
}
