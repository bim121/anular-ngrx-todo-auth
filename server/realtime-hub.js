import { WebSocketServer, WebSocket } from 'ws';

/**
 * Lightweight multi-browser todo sync hub (PF-1.1).
 * Clients connect with `?userId=` and broadcast JSON events to peers.
 */
export function startRealtimeHub(port = 3001) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (socket, req) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const userId = url.searchParams.get('userId') ?? 'anonymous';

    socket.send(
      JSON.stringify({
        type: 'presence',
        message: `Realtime connected as ${userId}`,
        at: new Date().toISOString(),
      })
    );

    socket.on('message', (raw) => {
      let payload;
      try {
        payload = JSON.parse(String(raw));
      } catch {
        return;
      }

      const outbound = JSON.stringify({
        ...payload,
        at: payload?.at ?? new Date().toISOString(),
      });

      for (const client of wss.clients) {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(outbound);
        }
      }
    });
  });

  console.log(`Realtime WebSocket hub on ws://localhost:${port}`);
  return wss;
}
