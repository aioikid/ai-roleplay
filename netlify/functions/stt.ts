export async function handler(event: any) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: '（STT処理はここに実装）' })
  };
}

// ========================
// functions/tts.ts
// ========================
export async function handler(event: any) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioUrl: '（TTS処理はここに実装）' })
  };
}
