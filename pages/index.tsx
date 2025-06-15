import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">AIロープレ</h1>
      <textarea
        className="border p-2 w-full max-w-md mb-4"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSend}
      >
        送信
      </button>
      <div className="mt-4 bg-white p-4 rounded shadow w-full max-w-md">
        <p>{response}</p>
      </div>
    </div>
  );
}
