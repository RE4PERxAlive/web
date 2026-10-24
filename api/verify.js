// api/verify.js
import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { owner_id, secret_key, system_uuid } = req.query;

  if (owner_id !== "e4b3c2a1-8765-4321-90ab-cdef12345678" || secret_key !== "bloody_sec_9f8e7d6c5b4a39281706f5e4d3c2b1a") {
    return res.status(403).json({ status: 0, message: "Invalid Owner or Secret Key" });
  }

  if (!system_uuid) {
    return res.status(400).json({ status: 0, message: "Missing System UUID" });
  }

  try {
    const { blobs } = await list({ prefix: 'uuids.json' });
    let db = [];
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      db = await response.json();
    }

    const targetUuid = system_uuid.trim().toUpperCase();
    
    const match = db.find(k => (k.uuid || k.system_uuid || "").trim().toUpperCase() === targetUuid);

    if (!match) {
      return res.status(200).json({ status: 0, message: "System UUID is not authorized" });
    }

    if (match.status !== 'Active') {
      return res.status(200).json({ status: 0, message: "System UUID is Revoked" });
    }

    // Expiration Check
    if (match.expireTimestamp && match.expireTimestamp > 0) {
      const now = Math.floor(Date.now() / 1000);
      if (now > match.expireTimestamp) {
        return res.status(200).json({ status: 0, message: "License has expired" });
      }
    }

    return res.status(200).json({ 
      status: 1, 
      message: "Authorized", 
      user: match.user,
      expires: match.expiresFormatted || 'Lifetime'
    });

  } catch (error) {
    return res.status(500).json({ status: 0, message: "Database fetch failed" });
  }
}