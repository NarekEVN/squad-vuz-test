import { Logger } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { type Namespace, type Socket } from 'socket.io';
import { ErrorCode } from '../../common/constants/error-codes.constants.js';
import { BEARER_PREFIX } from '../../common/constants/http.constants.js';
import { type AuthUser } from '../../common/types/request.types.js';
import { INVALID_TOKEN_MESSAGE } from '../auth/auth.constants.js';
import { AuthService } from '../auth/auth.service.js';
import { PopularityService } from './popularity.service.js';
import { REALTIME_NAMESPACE, ServerEvent } from './realtime.constants.js';
import { userRoom } from './realtime.rooms.js';
import {
  type PopularityMessage,
  type SocketData,
  type SquadChangedMessage,
} from './realtime.types.js';

function handshakeToken(socket: Socket): string | undefined {
  const auth = socket.handshake.auth as { token?: unknown };
  if (typeof auth.token === 'string' && auth.token) {
    return auth.token;
  }
  const header = socket.handshake.headers.authorization;
  return header?.startsWith(BEARER_PREFIX)
    ? header.slice(BEARER_PREFIX.length)
    : undefined;
}

function unauthorizedError(): Error {
  return Object.assign(new Error(INVALID_TOKEN_MESSAGE), {
    data: { error: ErrorCode.Unauthorized },
  });
}

@WebSocketGateway({ namespace: REALTIME_NAMESPACE })
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private readonly server: Namespace;

  constructor(
    private readonly authService: AuthService,
    private readonly popularityService: PopularityService,
  ) {}

  afterInit(server: Namespace): void {
    server.use((socket, next) => {
      void this.authenticate(socket).then((user) => {
        if (!user) {
          next(unauthorizedError());
          return;
        }
        (socket.data as SocketData).user = user;
        next();
      });
    });
  }

  async handleConnection(socket: Socket): Promise<void> {
    const { user } = socket.data as SocketData;
    if (!user) {
      socket.disconnect(true);
      return;
    }
    await socket.join(userRoom(user.id));
    try {
      socket.emit(
        ServerEvent.PopularityUpdated,
        await this.popularityService.snapshot(),
      );
    } catch (error) {
      this.logger.warn(`Could not send popularity snapshot: ${String(error)}`);
    }
  }

  emitSquadChanged(userId: string, message: SquadChangedMessage): void {
    this.server.to(userRoom(userId)).emit(ServerEvent.SquadChanged, message);
  }

  broadcastPopularity(message: PopularityMessage): void {
    this.server.emit(ServerEvent.PopularityUpdated, message);
  }

  private async authenticate(socket: Socket): Promise<AuthUser | undefined> {
    const token = handshakeToken(socket);
    return token ? this.authService.verifyAccessToken(token) : undefined;
  }
}
