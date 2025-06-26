import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const handler: Handler = async (event) => {
  return {
    statusCode: 501,
    body: 'STTは未実装です',
  };
};
