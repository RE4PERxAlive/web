import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'uuids.json' });
      if (blobs.length === 0) return res.status(200).json([]);
      
      const response = await fetch(blobs[0].url);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { action, keys } = req.body;
      if (action === 'save_all') {
        await put('uuids.json', JSON.stringify(keys, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/json'
        });
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
