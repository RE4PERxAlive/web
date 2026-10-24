// api/verify.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { owner_id, secret_key, system_uuid } = req.query;

  // 1. Validate Credentials
  if (owner_id !== "e4b3c2a1-8765-4321-90ab-cdef12345678" || secret_key !== "bloody_sec_9f8e7d6c5b4a39281706f5e4d3c2b1a") {
    return res.status(403).json({ status: 0, message: "Invalid Owner or Secret Key" });
  }

  if (!system_uuid) {
    return res.status(400).json({ status: 0, message: "Missing System UUID" });
  }

  try {
    // 2. Fetch keys from Upstash Database
    const keys = await kv.get('bloody_keys') || [];
    
    // 3. Find the UUID (Make sure both are uppercase and trimmed)
    const targetUuid = system_uuid.trim().toUpperCase();
    
    const match = keys.find(k => {
      const dbUuid = (k.uuid || k.system_uuid || "").trim().toUpperCase();
      return dbUuid === targetUuid;
    });

    // 4. Check status
    if (match) {
      if (match.status === 'Active') {
        return res.status(200).json({ status: 1, message: "Authorized", user: match.user });
      } else {
        return res.status(200).json({ status: 0, message: "System UUID is Revoked" });
      }
    } else {
      return res.status(200).json({ status: 0, message: "System UUID is not authorized" });
    }
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ status: 0, message: "Database error" });
  }
}