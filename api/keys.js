// api/keys.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const keys = await kv.get('bloody_keys') || [];
      return res.status(200).json(keys);
    }

    if (req.method === 'POST') {
      const { action, keys, newKey } = req.body;

      if (action === 'save_all') {
        await kv.set('bloody_keys', keys);
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}