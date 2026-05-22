import { ReadableStreamDefaultController } from 'stream/web';

declare global {
  // eslint-disable-next-line no-var
  var sseClientsGlobal: Set<ReadableStreamDefaultController> | undefined;
}

const clients: Set<ReadableStreamDefaultController> = globalThis.sseClientsGlobal ?? new Set();

if (process.env.NODE_ENV !== 'production') {
  globalThis.sseClientsGlobal = clients;
}

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
  console.log(`[SSE] Client connected. Total active clients: ${clients.size}`);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  const deleted = clients.delete(controller);
  if (deleted) {
    console.log(`[SSE] Client disconnected. Total active clients: ${clients.size}`);
  }
}

export function broadcast(event: string, data: unknown) {
  console.log(`[SSE] Broadcasting event: "${event}" to ${clients.size} clients`);
  const encoder = new TextEncoder();
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encodedPayload = encoder.encode(payload);

  const deadClients: ReadableStreamDefaultController[] = [];

  clients.forEach((controller) => {
    try {
      controller.enqueue(encodedPayload);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('[SSE] Failed to send event to client, marking for removal:', errMsg);
      deadClients.push(controller);
    }
  });

  // Clean up dead clients
  deadClients.forEach((controller) => {
    removeClient(controller);
    try {
      controller.close();
    } catch {
      // Ignore close errors on already dead controllers
    }
  });
}
