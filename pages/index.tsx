import { useState, useRef } from 'react'
import Script from 'next/script'

export default function Home() {
  const [device, setDevice] = useState<any>(null)
  const [conversation, setConversation] = useState<any[]>([])
  const [recording, setRecording] = useState<boolean>(false)
  const mediaRecorderRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const startCall = async () => {
    try {
      const res = await fetch('/api/token?identity=test_user')
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Token API error:', res.status, errorText)
        return
      }
      
      const data = await res.json()
      const token = data.token

      // @ts-ignore
      const Twilio = window.Twilio
      const newDevice = new Twilio.Device(token, { codecPreferences: ['opus', 'pcmu'], debug: true })
      newDevice.connect()
      setDevice(newDevice)
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const endCall = () => {
    if (device) device.disconnectAll()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')

          const sttRes = await fetch('/api/stt', { method: 'POST', body: formData })
          
          if (!sttRes.ok) {
            const errorText = await sttRes.text()
            console.error('STT API error:', sttRes.status, errorText)
            return
          }
          
          const sttData = await sttRes.json()
          const userText = sttData.text

          setConversation(prev => [...prev, { role: 'user', content: userText }])

          const chatRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: userText }] })
          })
          
          if (!chatRes.ok) {
            const errorText = await chatRes.text()
            console.error('Chat API error:', chatRes.status, errorText)
            return
          }
          
          const chatData = await chatRes.json()
          const reply = chatData.choices[0].message.content
          setConversation(prev => [...prev, { role: 'ai', content: reply }])

          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reply, voice: 'nova' })
          })
          
          if (!ttsRes.ok) {
            const errorText = await ttsRes.text()
            console.error('TTS API error:', ttsRes.status, errorText)
            return
          }
          
          const ttsBlob = await ttsRes.blob()
          const url = URL.createObjectURL(ttsBlob)
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.play()
          }
        } catch (error) {
          console.error('Error processing recording:', error)
        }
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <Script 
        src="https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js" 
        strategy="lazyOnload"
      />
      
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AIロープレ 本番PoC版
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={startCall} 
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md"
          >
            📞 通話開始
          </button>
          <button 
            onClick={endCall} 
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md"
          >
            📞 通話終了
          </button>
          <button 
            onClick={recording ? stopRecording : startRecording} 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md ${
              recording 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {recording ? '🛑 録音停止' : '🎤 録音開始'}
          </button>
        </div>

        <audio ref={audioRef} className="hidden" />
        
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold mb-4 text-gray-700 flex items-center">
            💬 会話履歴
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ会話がありません。録音を開始してください。
              </p>
            ) : (
              conversation.map((m, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-lg ${
                    m.role === 'user' 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'bg-green-100 border-l-4 border-green-500'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1 text-gray-600">
                    {m.role === 'user' ? '👤 ユーザー' : '🤖 AI'}
                  </div>
                  <div className="text-gray-800">{m.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
