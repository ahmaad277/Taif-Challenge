/**
 * /api/content — central store for custom game content (Vercel Blob).
 *
 * Everything is kept in a single public JSON blob (`content.json`). Because a
 * serverless response is size-limited (~4.5MB) while the content (with images)
 * can be larger, GET returns the blob's public URL and the client fetches it
 * directly from the CDN; writes do a read-modify-write of the blob server-side.
 *
 *   GET    -> { url }            (public; client fetches the URL for { items })
 *   POST   { item }  -> { ok }   (upsert by id; needs passcode)
 *   DELETE { id }    -> { ok }   (remove by id; needs passcode)
 *
 * Storage token: BLOB_READ_WRITE_TOKEN — injected automatically by the connected
 * Vercel Blob store (no manual env var needed).
 * Host passcode: CONTENT_WRITE_PASSCODE env, or 'taif' by default.
 */
const PASSCODE = process.env.CONTENT_WRITE_PASSCODE || 'taif';
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const FILE = 'content.json';

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'string') {
        try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
      }
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

async function findBlobUrl(list) {
  const { blobs } = await list({ prefix: FILE, token: TOKEN });
  const b = blobs.find((x) => x.pathname === FILE) || blobs[0];
  return b ? b.url : null;
}

async function readItems(url) {
  if (!url) return [];
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return [];
  try {
    const d = await r.json();
    return Array.isArray(d.items) ? d.items : [];
  } catch { return []; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-write-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (!TOKEN) { res.status(503).json({ error: 'storage-not-configured' }); return; }

  try {
    const { put, list } = await import('@vercel/blob');

    if (req.method === 'GET') {
      const url = await findBlobUrl(list);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ url });
      return;
    }

    if (req.method === 'POST' || req.method === 'DELETE') {
      if ((req.headers['x-write-key'] || '') !== PASSCODE) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }
      const body = await readBody(req);
      let items;
      try { items = await readItems(await findBlobUrl(list)); }
      catch (e) { res.status(500).json({ error: 'read-stage: ' + String((e && e.message) || e) }); return; }

      if (req.method === 'POST') {
        const item = body && body.item;
        if (!item || !item.id) { res.status(400).json({ error: 'bad-item' }); return; }
        const i = items.findIndex((x) => x.id === item.id);
        if (i >= 0) items[i] = item; else items.push(item);
      } else {
        const id = body && body.id;
        if (!id) { res.status(400).json({ error: 'bad-id' }); return; }
        items = items.filter((x) => x.id !== id);
      }

      let result;
      try {
        result = await put(FILE, JSON.stringify({ items, updatedAt: Date.now() }), {
          access: 'public',
          contentType: 'application/json',
          token: TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 0,
        });
      } catch (e) { res.status(500).json({ error: 'put-stage: ' + String((e && e.message) || e) }); return; }
      res.status(200).json({ ok: true, url: result.url });
      return;
    }

    res.status(405).json({ error: 'method-not-allowed' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
