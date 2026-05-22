import { ReadableStreamDefaultController } from 'stream/web';
import { addClient, removeClient } from '../../../lib/sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  let heartbeatInterval: NodeJS.Timeout;
  let activeController: ReadableStreamDefaultController | undefined;

  const stream = new ReadableStream({
    start(controller) {
      activeController = controller;
      addClient(controller);

      // Send initial connection OK comment
      try {
        controller.enqueue(new TextEncoder().encode(': ok\n\n'));
      } catch (err) {
        console.warn('[SSE] Initial enqueue failed', err);
      }

      // Heartbeat every 15 seconds to prevent gateway timeout
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.log(`[SSE] Heartbeat failed: ${errMsg}. Cleaning up client.`);
          clearInterval(heartbeatInterval);
          removeClient(controller);
          try {
            controller.close();
          } catch {
            // Ignore close errors
          }
        }
      }, 15000);
    },
    cancel() {
      console.log('[SSE] Connection cancelled by client');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (activeController) {
        removeClient(activeController);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
