// api/keys.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const dbPath = path.join('/tmp', 'uuids.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        return res.status(200).json(JSON.parse(data));
      }
      return res.status(200).json([]);
    } catch (e) {
      return res.status(500).json({ error: "Failed to read database" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, keys } = req.body;
      if (action === 'save_all') {
        fs.writeFileSync(dbPath, JSON.stringify(keys, null, 2), 'utf8');
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: "Invalid action" });
    } catch (e) {
      return res.status(500).json({ error: "Failed to save database" });
    }
  }
}