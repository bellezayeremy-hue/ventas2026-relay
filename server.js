const http = require('http');
const WebSocket = require('ws');
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Relay listo');
});

const wss = new WebSocket.Server({ server });
const rooms = new Map();

wss.on('connection', (ws) => {
  ws.room = null;
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      try {
        const texto = data.toString();
        const msg = JSON.parse(texto);
        if (msg.type === 'join') {
          const code = msg.code || msg.room || "";
          ws.room = code;
          if (!rooms.has(code)) rooms.set(code, new Set());
          rooms.get(code).add(ws);
          console.log('Se unio ' + code + ' ' + msg.role);
        }
      } catch (e) {}
      return;
    }
    if (!ws.room) return;
    const clients = rooms.get(ws.room);
    if (!clients) return;
    clients.forEach((c) => {
      if (c !== ws && c.readyState === WebSocket.OPEN) {
        c.send(data, { binary: true });
      }
    });
  });
  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log('Relay listo en puerto ' + port);
});
