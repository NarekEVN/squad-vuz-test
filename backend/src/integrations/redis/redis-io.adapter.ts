import { type INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { type Server, type ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly pubClient: Redis;
  private readonly subClient: Redis;

  constructor(
    app: INestApplicationContext,
    redisUrl: string,
    private readonly corsOrigins: string[],
    private readonly channelPrefix: string,
  ) {
    super(app);
    this.pubClient = new Redis(redisUrl);
    this.subClient = this.pubClient.duplicate();
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const serverOptions = {
      ...options,
      cors: { origin: this.corsOrigins, credentials: true },
    } as ServerOptions;
    const server: Server = super.createIOServer(port, serverOptions);
    server.adapter(
      createAdapter(this.pubClient, this.subClient, {
        key: this.channelPrefix,
      }),
    );
    return server;
  }

  override async close(server: Server): Promise<void> {
    await super.close(server);
    await Promise.allSettled([this.pubClient.quit(), this.subClient.quit()]);
  }
}
