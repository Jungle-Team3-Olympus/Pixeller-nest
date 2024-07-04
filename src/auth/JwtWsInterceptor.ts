// jwt-ws.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { JwtService } from '@nestjs/jwt';
  import { WsException } from '@nestjs/websockets';
  
  @Injectable()
  export class JwtWsInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const client = context.switchToWs().getClient();
      const token = client.handshake?.headers?.authorization?.split(' ')[1];
      console.log('token', token);
      if (!token || token === 'null' || token === null) {
        console.log('비상');
        throw new WsException('Unauthorized');
      }
  
      try {
        const decoded = this.jwtService.verify(token);
        // Attach the user to the context
        context.switchToWs().getData().user = decoded;
      } catch (err) {
        throw new WsException('Unauthorized');
      }
  
      return next.handle();
    }
  }
  