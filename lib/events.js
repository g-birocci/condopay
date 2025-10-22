// lib/events.js
// Simples mecanismo SSE em memória para simular eventos (admin/user)

const adminClients = new Set(); // respostas SSE dos admins
const userClients = new Map(); // email -> Set(res)

function sseHeaders(res) {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();
}

function onClose(res, cb) {
  res.on('close', cb);
  res.on('finish', cb);
  res.on('error', cb);
}

function subscribeAdmin(res) {
  sseHeaders(res);
  adminClients.add(res);
  res.write('event: connected\n');
  res.write('data: {"role":"admin","ok":true}\n\n');
  onClose(res, () => adminClients.delete(res));
}

function subscribeUser(email, res) {
  sseHeaders(res);
  const key = String(email).toLowerCase();
  if (!userClients.has(key)) userClients.set(key, new Set());
  userClients.get(key).add(res);
  res.write('event: connected\n');
  res.write(`data: {"role":"user","email":"${key}","ok":true}\n\n`);
  onClose(res, () => {
    const set = userClients.get(key);
    if (set) {
      set.delete(res);
      if (set.size === 0) userClients.delete(key);
    }
  });
}

function notifyAdmins(type, payload = {}) {
  const data = JSON.stringify({ type, ...payload });
  for (const res of adminClients) {
    try {
      res.write(`event: ${type}\n`);
      res.write(`data: ${data}\n\n`);
    } catch {}
  }
}

function notifyUser(email, type, payload = {}) {
  const key = String(email).toLowerCase();
  const set = userClients.get(key);
  if (!set || set.size === 0) return;
  const data = JSON.stringify({ type, ...payload });
  for (const res of set) {
    try {
      res.write(`event: ${type}\n`);
      res.write(`data: ${data}\n\n`);
    } catch {}
  }
}

module.exports = { subscribeAdmin, subscribeUser, notifyAdmins, notifyUser };

