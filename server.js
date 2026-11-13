const WebSocket = require('ws');
const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

const rooms = new Map(); // codigo -> Set de clientes

wss.on('connection', (ws) => {
  ws.room = null;

  ws.on('message', (data, isBinary) => {
    // Si es imagen (binario), reenviar a todos los de la misma sala
    if (isBinary) {
      if (!ws.room) return;
      const clients = rooms.get(ws.room);
      if (!clients) return;
      clients.forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(data, { binary: true });
        }
      });
      return;
    }

    // Si es texto (join)
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'join') {
        const code = msg.code || msg.room || msg.codigo || "";
        ws.room = code;
        if (!rooms.has(code)) rooms.set(code, new Set());
        rooms.get(code).add(ws);
        console.log('Se unió al código', code, 'rol:', msg.role);
        ws.send(JSON.stringify({ type: 'joined', code: code }));
      }
    } catch (e) { console.log('Error mensaje', e); }
  });

  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
    }
  });
});

console.log('Relay corriendo en puerto ' + port);
