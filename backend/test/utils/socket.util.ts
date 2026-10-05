import { type Server } from 'node:http';
import { type AddressInfo } from 'node:net';
import { io, type Socket } from 'socket.io-client';
import { type TestApp } from './create-app.js';
import { type PopularityBody } from './test.types.js';

const EVENT_TIMEOUT_MS = 3000;

export async function listen(app: TestApp): Promise<string> {
  await app.listen(0, '127.0.0.1');
  const server = app.getHttpServer() as unknown as Server;
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

function createSocket(baseUrl: string, token?: string): Socket {
  return io(`${baseUrl}/realtime`, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
    autoConnect: false,
  });
}

export function nextEvent<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const handler = (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out waiting for ${event}`));
    }, EVENT_TIMEOUT_MS);
    socket.once(event, handler);
  });
}

export function collectEvents<T>(
  socket: Socket,
  event: string,
  durationMs: number,
): Promise<T[]> {
  const received: T[] = [];
  const handler = (payload: T) => received.push(payload);
  socket.on(event, handler);
  return new Promise((resolve) =>
    setTimeout(() => {
      socket.off(event, handler);
      resolve(received);
    }, durationMs),
  );
}

export function connectSocket(
  baseUrl: string,
  token?: string,
): Promise<Socket> {
  const socket = createSocket(baseUrl, token);
  const connected = new Promise<Socket>((resolve, reject) => {
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', (error) => {
      socket.close();
      reject(error);
    });
  });
  socket.connect();
  return connected;
}

export async function connectWithSnapshot(
  baseUrl: string,
  token: string,
): Promise<{ socket: Socket; snapshot: PopularityBody }> {
  const socket = createSocket(baseUrl, token);
  const snapshot = nextEvent<PopularityBody>(socket, 'popularity:updated');
  socket.connect();
  return { socket, snapshot: await snapshot };
}
