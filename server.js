const WebSocket = require('ws');
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });
const rooms = new Map();

wss.on('connection', (ws) => {
  ws.room = null;
  ws.on('message', (data) => {
    const esTexto = typeof data === 'string';
    if (!esTexto) {
      if (!ws.room) return;
      const clients = rooms.get(ws.room);
      if (!clients) return;
      clients.forEach((c) => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(data, { binary: true });
        }
      });
      return;
    }
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'join') {
        const code = msg.code || msg.room || "";
        ws.room = code;
        if (!rooms.has(code)) rooms.set(code, new Set());
        rooms.get(code).add(ws);
        console.log('Se unio ' + code + ' ' + msg.role);
      }
    } catch (e) {}
  });
  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
    }
  });
});

console.log('Relay listo en puerto ' + port);
