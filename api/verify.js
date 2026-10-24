// api/verify.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
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

  let authorizedUUIDs = [];
  const dbPath = path.join('/tmp', 'uuids.json');

  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      authorizedUUIDs = JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading DB", e);
  }

  const targetUuid = system_uuid.trim().toUpperCase();
  
  // Check if the UUID is in the list (case-insensitive)
  const match = authorizedUUIDs.find(k => 
    (k.uuid || k.system_uuid || "").trim().toUpperCase() === targetUuid
  );

  if (match && match.status === 'Active') {
    return res.status(200).json({ status: 1, message: "Authorized", user: match.user });
  } else if (match && match.status !== 'Active') {
    return res.status(200).json({ status: 0, message: "System UUID is Revoked" });
  } else {
    return res.status(200).json({ status: 0, message: "System UUID is not authorized" });
  }
}