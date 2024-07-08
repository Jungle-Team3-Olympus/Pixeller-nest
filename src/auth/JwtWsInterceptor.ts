// jwt-ws.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class JwtWsInterceptor implements NestInterceptor {
  private lastVerified: number = 0;
  private verificationInterval: number = 10000; // 1분 (60,000 밀리초)

  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const token = client.handshake?.headers?.authorization?.split(' ')[1];
    if (!token || token === 'null' || token === null) {
      client.emit('error', { message: 'Unauthorized' });
      throw new WsException('Unauthorized');
    }

    const now = Date.now();
    if (now - this.lastVerified < this.verificationInterval) {
      // 이전 검증 시점으로부터 충분한 시간이 지나지 않았다면 검증을 건너뜀
      // return next.handle();
    }

    // console.log('token', token);

    try {
      const decoded = this.jwtService.verify(token);
      // console.log('decoded', decoded);
      // Attach the user to the context
      client.handshake.user = decoded;
      // context.switchToWs().getData().user = decoded;
      this.lastVerified = now; // 마지막 검증 시점 업데이트
    } catch (err) {
      client.emit('error', { message: 'Unauthorized' });
      throw new WsException('Unauthorized');
    }

    return next.handle().pipe(
      catchError((err) => {
        client.emit('error', { message: 'Unauthorized' });
        return throwError(() => new WsException('Unauthorized'));
      }),
    );
  }
}
