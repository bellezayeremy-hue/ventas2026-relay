const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });
const rooms = new Map();
wss.on('connection', (ws) => {
  let room = null;
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'join') {
        room = msg.room;
        if (!rooms.has(room)) rooms.set(room, new Set());
        rooms.get(room).add(ws);
      }
      return;
    }
    if (room && rooms.has(room)) {
      rooms.get(room).forEach(client => {
        if (client !== ws && client.readyState === 1) client.send(data, { binary: true });
      });
    }
  });
  ws.on('close', () => {
    if (room && rooms.has(room)) rooms.get(room).delete(ws);
  });
});
console.log('Relay listo');
